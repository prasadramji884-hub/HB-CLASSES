import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { hashFingerprint } from '@/lib/encryption';
import { createToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, fingerprint, name, role = 'student' } = await request.json();

    if (!email || !otp || !fingerprint) {
      return NextResponse.json(
        { error: 'Email, OTP, and device fingerprint are required' },
        { status: 400 }
      );
    }

    // Get stored OTP
    const { data: otpData } = await supabaseServer
      .from('app_settings')
      .select('value')
      .eq('key', `otp_${email}`)
      .single();

    if (!otpData) {
      return NextResponse.json(
        { error: 'OTP expired or not found. Please request a new one.' },
        { status: 400 }
      );
    }

    const otpRecord = JSON.parse(otpData.value);

    // Check expiration
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabaseServer
        .from('app_settings')
        .delete()
        .eq('key', `otp_${email}`);

      return NextResponse.json(
        { error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await supabaseServer
        .from('app_settings')
        .delete()
        .eq('key', `otp_${email}`);

      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      await supabaseServer
        .from('app_settings')
        .upsert({
          key: `otp_${email}`,
          value: JSON.stringify({
            ...otpRecord,
            attempts: otpRecord.attempts + 1,
          }),
        });

      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // Delete used OTP
    await supabaseServer
      .from('app_settings')
      .delete()
      .eq('key', `otp_${email}`);

    // Check if user exists
    let { data: user } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // If new user, create account
    if (!user) {
      if (!name) {
        return NextResponse.json(
          { error: 'Name is required for new registration' },
          { status: 400 }
        );
      }

      const { data: newUser, error: createError } = await supabaseServer
        .from('users')
        .insert({
          email,
          name,
          role,
          device_fingerprint: hashFingerprint(fingerprint),
          is_approved: role === 'student' ? false : true, // Students need approval
          is_banned: false,
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create account' },
          { status: 500 }
        );
      }

      user = newUser;
    } else {
      // Check device fingerprint for students
      if (user.role === 'student') {
        const storedFingerprint = user.device_fingerprint;
        const currentFingerprint = hashFingerprint(fingerprint);

        if (storedFingerprint && storedFingerprint !== currentFingerprint) {
          return NextResponse.json(
            { error: 'This account is bound to another device. Please contact admin.' },
            { status: 403 }
          );
        }

        // Update fingerprint if not set
        if (!storedFingerprint) {
          await supabaseServer
            .from('users')
            .update({ device_fingerprint: currentFingerprint })
            .eq('id', user.id);
        }
      }

      // Update last login
      await supabaseServer
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', user.id);
    }

    // Check if banned
    if (user.is_banned) {
      return NextResponse.json(
        { error: 'Your account has been banned. Contact admin for support.' },
        { status: 403 }
      );
    }

    // Check approval for students
    if (user.role === 'student' && !user.is_approved) {
      return NextResponse.json({
        success: true,
        requiresApproval: true,
        message: 'Your account is pending approval. You will be notified once approved.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_approved: user.is_approved,
        },
      });
    }

    // Create JWT token
    const token = await createToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_banned: user.is_banned,
      is_approved: user.is_approved,
    }, '7d');

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_approved: user.is_approved,
      },
    });

    response.cookies.set('hb_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}