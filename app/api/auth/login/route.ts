import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface LoginData {
  password: string;
}

export async function POST(request: Request) {
  try {
    const data: LoginData = await request.json();

    if (data.password !== process.env.RESOURCES_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const cookieStore = cookies();
    
    // Set auth cookie and admin flag - all authenticated users are admins
    cookieStore.set('resources-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return NextResponse.json({
      success: true,
      isAdmin: true
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 