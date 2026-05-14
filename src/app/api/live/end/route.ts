import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get('hb_token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(authToken);
    if (!payload || !['admin', 'teacher'].includes(payload.role as string)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Update session status
    const { data, error } = await supabaseServer
      .from('live_sessions')
      .update({
        status: 'ended',
        ended_at: now,
        updated_at: now,
      })
      .eq('id', sessionId)
      .eq('teacher_id', payload.sub) // Only teacher who started can end
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
    }

    // Notify students that session ended
    const { data: notification } = await supabaseServer
      .from('notifications')
      .insert({
        title: 'Live Class Ended',
        message: `"${data.title}" has ended. Watch the recording now!`,
        type: 'live',
        course_id: data.course_id,
        sent_by: payload.sub,
      })
      .select()
      .single();

    if (notification && data.course_id) {
      const { data: enrollments } = await supabaseServer
        .from('enrollments')
        .select('student_id')
        .eq('course_id', data.course_id)
        .eq('status', 'active');

      if (enrollments) {
        const userNotifications = enrollments.map(e => ({
          user_id: e.student_id,
          notification_id: notification.id,
          is_read: false,
        }));
        await supabaseServer.from('user_notifications').insert(userNotifications);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Live session ended. Recording is now available.',
      session: data,
    });
  } catch (error) {
    console.error('End live error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}