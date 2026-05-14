import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hb-classes-jwt-secret-key-2024!!'
);

const PUBLIC_PATHS = ['/auth/login', '/maintenance', '/api/auth'];
const STATIC_PATHS = ['/_next', '/static', '/favicon', '/manifest', '/sw.js'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and public paths
  if (STATIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('hb_token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      clockTolerance: 60,
    });

    const userRole = payload.role as string;
    const isBanned = payload.is_banned as boolean;
    const isApproved = payload.is_approved as boolean;

    if (isBanned) {
      const response = NextResponse.redirect(new URL('/auth/login?error=banned', request.url));
      response.cookies.delete('hb_token');
      return response;
    }

    // Role-based route protection
    if (pathname.startsWith('/admin/') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/student/home', request.url));
    }

    if (pathname.startsWith('/teacher/') && userRole !== 'teacher' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/student/home', request.url));
    }

    if (pathname.startsWith('/student/') && !['student', 'teacher', 'admin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check maintenance mode for non-admin users
    if (userRole !== 'admin' && !pathname.startsWith('/api/')) {
      // This would typically check a setting in the database
      // For now, we'll skip this check in middleware and handle it in layout
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub as string);
      requestHeaders.set('x-user-role', userRole);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  } catch (error) {
    // Token invalid or expired
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/auth/login?error=session_expired', request.url));
    response.cookies.delete('hb_token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
};