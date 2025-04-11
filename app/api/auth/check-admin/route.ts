import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const adminPassword = request.headers.get('X-Admin-Password');
    
    if (!adminPassword) {
      return NextResponse.json({ isAdmin: false, message: 'No admin password provided' }, { status: 401 });
    }

    const expectedPassword = process.env.RESOURCES_PASSWORD;
    if (!expectedPassword) {
      console.error('RESOURCES_PASSWORD environment variable is not set');
      return NextResponse.json({ isAdmin: false, message: 'Server configuration error' }, { status: 500 });
    }

    const isAdmin = adminPassword === expectedPassword;
    
    if (!isAdmin) {
      return NextResponse.json({ isAdmin: false, message: 'Invalid admin password' }, { status: 401 });
    }

    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error('Error in admin check:', error);
    return NextResponse.json({ isAdmin: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
} 