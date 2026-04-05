// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  // Redirect to login if trying to access admin routes without authentication
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check if user is admin for admin routes
  if (isAdminRoute && token && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
  ],
};