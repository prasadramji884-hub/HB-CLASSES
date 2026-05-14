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

    const { title, message, type = 'general', course_id, target = 'all' } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Create notification
    const { data: notification, error: notifError } = await supabaseServer
      .from('notifications')
      .insert({
        title,
        message,
        type,
        course_id,
        sent_by: payload.sub,
      })
      .select()
      .single();

    if (notifError || !notification) {
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    // Get target users
    let userQuery = supabaseServer.from('users').select('id');

    if (target === 'students') {
      userQuery = userQuery.eq('role', 'student');
    } else if (target === 'teachers') {
      userQuery = userQuery.eq('role', 'teacher');
    } else if (course_id) {
      // Get enrolled students for specific course
      const { data: enrollments } = await supabaseServer
        .from('enrollments')
        .select('student_id')
        .eq('course_id', course_id)
        .eq('status', 'active');

      if (enrollments && enrollments.length > 0) {
        const studentIds = enrollments.map(e => e.student_id);
        userQuery = userQuery.in('id', studentIds);
      }
    }

    const { data: users } = await userQuery;

    if (users && users.length > 0) {
      // Create user notifications
      const userNotifications = users.map(user => ({
        user_id: user.id,
        notification_id: notification.id,
        is_read: false,
      }));

      await supabaseServer
        .from('user_notifications')
        .insert(userNotifications);
    }

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${users?.length || 0} users`,
      notification,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}