import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { generateOTP, hashFingerprint } from '@/lib/encryption';
import { sendOTP } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, fingerprint } = await request.json();

    if (!email || !fingerprint) {
      return NextResponse.json(
        { error: 'Email and device fingerprint are required' },
        { status: 400 }
      );
    }

    // Check cooldown (60 seconds)
    const { data: existingOtp } = await supabaseServer
      .from('app_settings')
      .select('value')
      .eq('key', `otp_${email}`)
      .single();

    if (existingOtp) {
      const otpRecord = JSON.parse(existingOtp.value);
      const timeSinceLastOtp = Date.now() - new Date(otpRecord.created_at || Date.now()).getTime();

      if (timeSinceLastOtp < 60000) {
        const remainingSeconds = Math.ceil((60000 - timeSinceLastOtp) / 1000);
        return NextResponse.json(
          { error: `Please wait ${remainingSeconds} seconds before requesting a new OTP` },
          { status: 429 }
        );
      }
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Store new OTP
    await supabaseServer
      .from('app_settings')
      .upsert({
        key: `otp_${email}`,
        value: JSON.stringify({
          otp,
          expires_at: expiresAt,
          attempts: 0,
          fingerprint: hashFingerprint(fingerprint),
          created_at: new Date().toISOString(),
        }),
      });

    // Get user name if exists
    const { data: user } = await supabaseServer
      .from('users')
      .select('name')
      .eq('email', email)
      .single();

    // Send OTP
    const emailSent = await sendOTP(email, otp, user?.name);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP resent successfully',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}