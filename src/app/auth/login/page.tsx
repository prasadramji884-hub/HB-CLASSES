"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, User, Shield, Smartphone, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'register' | 'pending'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isExistingUser, setIsExistingUser] = useState(false);

  const getFingerprint = useCallback(() => {
    const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;
    return `${userAgent}|${platform}|${screen}|${timezone}`;
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fingerprint: getFingerprint() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setIsExistingUser(data.isExistingUser);
      setStep('otp');
      setCountdown(60);
      toast.success('OTP sent to your email!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          fingerprint: getFingerprint(),
          name: !isExistingUser ? name : undefined,
          role: !isExistingUser ? role : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      if (data.requiresApproval) {
        setStep('pending');
        toast.success('Registration successful! Pending admin approval.');
        return;
      }

      toast.success('Login successful!');

      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (data.user.role === 'teacher') {
          window.location.href = '/teacher/dashboard';
        } else {
          window.location.href = '/student/home';
        }
      }, 500);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fingerprint: getFingerprint() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setCountdown(60);
      toast.success('New OTP sent!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent2/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 mb-4"
          >
            <Shield className="w-8 h-8 text-accent" />
          </motion.div>
          <h1 className="font-syne text-3xl font-bold text-gradient mb-2">
            HB CLASSES
          </h1>
          <p className="text-muted text-sm">
            Online English Coaching Platform
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl shadow-black/20">
          <AnimatePresence mode="wait">
            {/* Email Step */}
            {step === 'email' && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOTP}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-text mb-1">Welcome Back</h2>
                  <p className="text-sm text-muted">Enter your email to get started</p>
                </div>

                <Input
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue
                </Button>

                <p className="text-center text-xs text-muted mt-4">
                  New user? Don&apos;t worry, we&apos;ll create your account automatically
                </p>
              </motion.form>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOTP}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-3">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-xl font-semibold text-text mb-1">Enter OTP</h2>
                  <p className="text-sm text-muted">
                    We sent a 6-digit code to <span className="text-accent">{email}</span>
                  </p>
                </div>

                {!isExistingUser && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      leftIcon={<User className="w-4 h-4" />}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-muted mb-1.5">I am a</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole('student')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                            role === 'student'
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-border text-muted hover:border-accent/50'
                          }`}
                        >
                          <User className="w-4 h-4" />
                          Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('teacher')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                            role === 'teacher'
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-border text-muted hover:border-accent/50'
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                          Teacher
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <Input
                  type="text"
                  label="OTP Code"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  leftIcon={<Smartphone className="w-4 h-4" />}
                  maxLength={6}
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                >
                  Verify &amp; Login
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-muted hover:text-accent transition-colors"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || isResending}
                    className="flex items-center gap-1 text-accent hover:text-blue-400 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* Pending Approval */}
            {step === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 mb-4">
                  <CheckCircle className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-xl font-semibold text-text mb-2">Account Pending Approval</h2>
                <p className="text-muted text-sm mb-6">
                  Your registration is successful! An admin will review and approve your account shortly.
                  You will receive an email once approved.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('email');
                    setEmail('');
                    setOtp('');
                  }}
                >
                  Back to Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
