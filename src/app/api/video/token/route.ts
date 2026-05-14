import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { createVideoToken, verifyToken as verifyJWT } from '@/lib/jwt';
import { decrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const authToken = request.cookies.get('hb_token')?.value;

    if (!videoId || !authToken) {
      return NextResponse.json(
        { error: 'Video ID and authentication required' },
        { status: 400 }
      );
    }

    // Verify auth token
    const payload = await verifyJWT(authToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const userId = payload.sub;
    const userRole = payload.role as string;

    // Get video details
    const { data: video } = await supabaseServer
      .from('videos')
      .select('*, courses(*)')
      .eq('id', videoId)
      .single();

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check enrollment for private/enrolled videos
    if (video.visibility === 'enrolled') {
      const { data: enrollment } = await supabaseServer
        .from('enrollments')
        .select('*')
        .eq('student_id', userId)
        .eq('course_id', video.course_id)
        .eq('status', 'active')
        .single();

      if (!enrollment && userRole !== 'admin' && userRole !== 'teacher') {
        return NextResponse.json(
          { error: 'You do not have access to this video' },
          { status: 403 }
        );
      }
    }

    // CRITICAL: Create temporary video token (2 hour expiry)
    const token = await createVideoToken(videoId, userId);

    // Store token in database with expiry
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    await supabaseServer
      .from('video_tokens')
      .insert({
        video_id: videoId,
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
      });

    // CRITICAL: Decrypt URL only at this moment, only for this user
    // The actual YouTube URL is NEVER sent to frontend
    // Only the embed-ready video ID is sent
    const decryptedUrl = decrypt(video.youtube_url_encrypted);

    // Validate it's actually a YouTube URL (security check)
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/;
    if (!youtubeRegex.test(decryptedUrl)) {
      return NextResponse.json(
        { error: 'Invalid video source' },
        { status: 500 }
      );
    }

    // Return ONLY what's needed - NEVER the full URL
    return NextResponse.json({
      success: true,
      token,
      videoId: video.youtube_video_id, // Only ID, not full URL
      title: video.title,
      expiresIn: 7200, // 2 hours in seconds
      expiresAt: expiresAt.toISOString(),
      // Security headers
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
  } catch (error) {
    console.error('Video token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}