import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string): { exp?: number; role?: string } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through Next internals and static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') ||
      pathname === '/favicon.ico' || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  const payload = token ? decodeJwt(token) : null;
  const valid = !!(payload?.exp && Date.now() < payload.exp * 1000);

  // Not logged in → send to /login (except if already there)
  if (!valid && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in → redirect away from /login to /students
  if (valid && pathname === '/login') {
    return NextResponse.redirect(new URL('/students', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
