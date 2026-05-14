import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('hb_token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(authToken);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: settings } = await supabaseServer
      .from('app_settings')
      .select('*');

    return NextResponse.json({ settings: settings || [] });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const { settings } = await request.json();

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
    }

    // Upsert all settings
    const { error } = await supabaseServer
      .from('app_settings')
      .upsert(
        settings.map((s: any) => ({
          key: s.key,
          value: s.value,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'key' }
      );

    if (error) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}