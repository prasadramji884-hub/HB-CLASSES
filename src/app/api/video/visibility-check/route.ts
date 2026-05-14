import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const authToken = request.cookies.get('hb_token')?.value;

    if (!videoId || !authToken) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const payload = await verifyToken(authToken);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if video exists and user has access
    const { data: video } = await supabaseServer
      .from('videos')
      .select('id, title, visibility, course_id, is_live')
      .eq('id', videoId)
      .single();

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check access
    let hasAccess = false;
    if (video.visibility === 'public') {
      hasAccess = true;
    } else {
      const { data: enrollment } = await supabaseServer
        .from('enrollments')
        .select('*')
        .eq('student_id', payload.sub)
        .eq('course_id', video.course_id)
        .eq('status', 'active')
        .single();

      hasAccess = !!enrollment || payload.role === 'admin' || payload.role === 'teacher';
    }

    return NextResponse.json({
      hasAccess,
      video: {
        id: video.id,
        title: video.title,
        isLive: video.is_live,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}