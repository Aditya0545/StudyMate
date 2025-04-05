import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const adminPassword = process.env.RESOURCES_PASSWORD;

    // Check if admin password is configured
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Server configuration error: Admin password not set' },
        { status: 500 }
      );
    }

    // Check if password was provided
    if (!data.password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Validate password
    if (data.password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Return success with the admin password for localStorage
    return NextResponse.json({
      success: true,
      isAdmin: true,
      password: adminPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 