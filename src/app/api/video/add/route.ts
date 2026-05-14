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
      courseId, 
      title, 
      description, 
      youtubeUrl, 
      visibility = 'enrolled',
      category = 'lecture',
      orderNum = 0,
      isLive = false
    } = await request.json();

    if (!courseId || !title || !youtubeUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Extract Video ID from YouTube URL
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const videoId = videoIdMatch[1];

    // CRITICAL: Encrypt the FULL YouTube URL immediately
    // Even if someone gets DB access, they can't see the actual URL
    const encryptedUrl = encrypt(youtubeUrl);

    // Store in database
    const { data, error } = await supabaseServer
      .from('videos')
      .insert({
        course_id: courseId,
        title,
        description,
        youtube_url_encrypted: encryptedUrl,
        youtube_video_id: videoId, // Only store ID for embed, never full URL
        visibility,
        category,
        order_num: orderNum,
        is_live: isLive,
        created_by: payload.sub,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to add video' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      video: data,
      message: 'Video added successfully. URL encrypted and secured.'
    });
  } catch (error) {
    console.error('Add video error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}