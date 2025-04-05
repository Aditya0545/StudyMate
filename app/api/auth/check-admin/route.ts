import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get the admin password from localStorage on the client side
    const adminPassword = request.headers.get('X-Admin-Password');
    const configuredPassword = process.env.RESOURCES_PASSWORD;

    if (!configuredPassword) {
      console.error('RESOURCES_PASSWORD environment variable is not set');
      return NextResponse.json({ 
        isAdmin: false, 
        isAuthenticated: false,
        error: 'Server configuration error' 
      });
    }

    const isAdmin = adminPassword === configuredPassword;

    return NextResponse.json({
      isAdmin,
      isAuthenticated: isAdmin,
      message: isAdmin ? 'Admin authenticated' : 'Not authenticated as admin'
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ 
      isAdmin: false, 
      isAuthenticated: false,
      error: 'Failed to check admin status' 
    });
  }
} 