import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Delete token from database
    await supabaseServer
      .from('video_tokens')
      .delete()
      .eq('token', token);

    return NextResponse.json({ success: true, message: 'Token invalidated' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}