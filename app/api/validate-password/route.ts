import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    
    // Get the password from environment variables
    const correctPassword = process.env.RESOURCES_PASSWORD;
    
    // Validate the password
    const valid = password === correctPassword;
    
    // Return a response
    return NextResponse.json({ valid });
  } catch (error) {
    console.error('Error validating password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 