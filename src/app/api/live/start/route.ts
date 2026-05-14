import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { encrypt } from '@/lib/encryption';
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

    const { 
      title, 
      description, 
      youtubeUrl, 
      scheduledAt,
      isScheduled = false,
      courseId 
    } = await request.json();

    if (!title || !youtubeUrl) {
      return NextResponse.json({ error: 'Title and YouTube URL required' }, { status: 400 });
    }

    // Extract Video ID
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const videoId = videoIdMatch[1];

    // CRITICAL: Encrypt the full URL immediately
    const encryptedUrl = encrypt(youtubeUrl);

    // Determine status
    const status = isScheduled ? 'scheduled' : 'live';
    const now = new Date().toISOString();

    // Create live session
    const { data, error } = await supabaseServer
      .from('live_sessions')
      .insert({
        teacher_id: payload.sub,
        course_id: courseId || null,
        title,
        description: description || '',
        youtube_live_url_encrypted: encryptedUrl,
        youtube_video_id: videoId,
        status,
        scheduled_at: scheduledAt || now,
        started_at: status === 'live' ? now : null,
        viewer_count: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // If live now, send notifications to enrolled students
    if (status === 'live') {
      // Get enrolled students for this course
      const { data: enrollments } = await supabaseServer
        .from('enrollments')
        .select('student_id')
        .eq('course_id', courseId)
        .eq('status', 'active');

      if (enrollments && enrollments.length > 0) {
        // Create notification
        const { data: notification } = await supabaseServer
          .from('notifications')
          .insert({
            title: 'Live Class Started!',
            message: `"${title}" is now live. Join now!`,
            type: 'live',
            course_id: courseId,
            sent_by: payload.sub,
          })
          .select()
          .single();

        if (notification) {
          // Distribute to students
          const userNotifications = enrollments.map(e => ({
            user_id: e.student_id,
            notification_id: notification.id,
            is_read: false,
          }));

          await supabaseServer.from('user_notifications').insert(userNotifications);
        }
      }
    }

    return NextResponse.json({
      success: true,
      session: data,
      message: status === 'live' 
        ? 'Live session started! Students notified.' 
        : 'Live session scheduled successfully.',
    });
  } catch (error) {
    console.error('Start live error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}