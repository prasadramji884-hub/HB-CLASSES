import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { generateOTP, hashFingerprint } from '@/lib/encryption';
import { sendOTP } from '@/lib/email';
import { createToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, fingerprint } = await request.json();

    if (!email || !fingerprint) {
      return NextResponse.json(
        { error: 'Email and device fingerprint are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

    // Store OTP in app_settings (temporary storage)
    await supabaseServer
      .from('app_settings')
      .upsert({
        key: `otp_${email}`,
        value: JSON.stringify({
          otp,
          expires_at: expiresAt,
          attempts: 0,
          fingerprint: hashFingerprint(fingerprint),
        }),
      });

    // Check if user exists
    const { data: user } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // Send OTP via email
    const emailSent = await sendOTP(email, otp, user?.name);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      isExistingUser: !!user,
      email,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}