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
    if (!payload || payload.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    // Check if already enrolled
    const { data: existing } = await supabaseServer
      .from('enrollments')
      .select('*')
      .eq('student_id', payload.sub)
      .eq('course_id', courseId)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled or pending' }, { status: 400 });
    }

    // Create enrollment request
    const { data, error } = await supabaseServer
      .from('enrollments')
      .insert({
        student_id: payload.sub,
        course_id: courseId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
    }

    return NextResponse.json({ success: true, enrollment: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}