import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.RESOURCES_PASSWORD;

    if (!correctPassword) {
      console.error('RESOURCES_PASSWORD environment variable is not set');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (password === correctPassword) {
      // Set a secure HTTP-only cookie with proper production settings
      const response = NextResponse.json(
        { success: true },
        { status: 200 }
      );
      
      // Set cookie with improved security settings
      response.cookies.set('resources-auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        priority: 'high'
      });
      
      return response;
    }

    // Add a small delay to prevent brute force attacks
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 