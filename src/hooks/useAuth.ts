"use client";

import { useState, useEffect, useCallback } from 'react';
import { verifyToken } from '@/lib/jwt';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const checkAuth = useCallback(async () => {
    try {
      // Check for token in cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('hb_token='))
        ?.split('=')[1];

      if (!token) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      const payload = await verifyToken(token);

      if (!payload) {
        // Token invalid, clear it
        document.cookie = 'hb_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      setState({
        user: {
          id: payload.sub as string,
          email: payload.email as string,
          name: payload.name as string,
          role: payload.role as 'student' | 'teacher' | 'admin',
          is_banned: payload.is_banned as boolean,
          is_approved: payload.is_approved as boolean,
        } as User,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(() => {
    document.cookie = 'hb_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setState({ user: null, isLoading: false, isAuthenticated: false });
    window.location.href = '/auth/login';
  }, []);

  return { ...state, logout, refresh: checkAuth };
}