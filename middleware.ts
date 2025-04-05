import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
    const adminPassword = request.headers.get('X-Admin-Password');
    
    if (!adminPassword || adminPassword !== process.env.RESOURCES_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  // For protected paths (new, edit, delete), allow access and let the client-side handle auth
  if (isProtectedPath) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/resources/:path*',
    '/api/resources/:path*'
  ]
}; 