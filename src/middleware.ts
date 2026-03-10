import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('__session');
  if (!session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard',
    '/admin/upload',
    '/admin/edit/:path*',
    '/admin/seed',
    '/admin/inquiries',
    '/admin/enhance',
    '/admin/guestbook',
    '/admin/logs',
  ],
};
