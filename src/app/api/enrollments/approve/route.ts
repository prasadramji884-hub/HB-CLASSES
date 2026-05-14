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

    const { enrollmentId } = await request.json();
    if (!enrollmentId) {
      return NextResponse.json({ error: 'Enrollment ID required' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('enrollments')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', enrollmentId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to approve enrollment' }, { status: 500 });
    }

    return NextResponse.json({ success: true, enrollment: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}