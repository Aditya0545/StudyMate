import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for the resources page
  if (request.nextUrl.pathname.startsWith('/resources')) {
    const isAuthenticated = request.cookies.get('resources-auth')?.value === 'true';

    // If not authenticated and not already on the login page, redirect to login
    if (!isAuthenticated && !request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/resources/:path*']
}; 