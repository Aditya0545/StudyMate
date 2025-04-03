import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAdmin } from './app/config/admins';

// List of paths that require admin access
const ADMIN_PATHS = [
  '/resources/new',
  '/resources/edit',
  '/api/resources/new',
  '/api/resources/edit',
  '/api/resources/delete'
];

// List of paths that are public
const PUBLIC_PATHS = [
  '/resources',
  '/api/resources'  // GET requests to view resources
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const method = request.method;
  
  // Check if this is a protected path
  const isProtectedPath = ADMIN_PATHS.some(adminPath => path.startsWith(adminPath));
  
  // Allow public access to GET requests on public paths
  if (PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath)) && method === 'GET') {
    return NextResponse.next();
  }
  
  // For non-GET requests to /api/resources, require admin access
  if (path.startsWith('/api/resources') && method !== 'GET') {
    const authCookie = request.cookies.get('resources-auth');
    const adminEmail = request.cookies.get('admin-email');
    
    if (!authCookie || !adminEmail || !isAdmin(adminEmail.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  // For protected paths (new, edit, delete), require admin access
  if (isProtectedPath) {
    const authCookie = request.cookies.get('resources-auth');
    const adminEmail = request.cookies.get('admin-email');
    
    if (!authCookie || !adminEmail) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Check if the user is an admin
    if (!isAdmin(adminEmail.value)) {
      // Redirect non-admins to the resources page with read-only access
      return NextResponse.redirect(new URL('/resources', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/resources/:path*',
    '/api/resources/:path*'
  ]
}; 