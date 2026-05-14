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
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('users')
      .update({ is_banned: true, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'User banned' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}