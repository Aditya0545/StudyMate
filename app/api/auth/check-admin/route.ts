import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const authCookie = cookieStore.get('resources-auth');
  
  // If authenticated, user is admin
  const isAuthenticated = authCookie?.value === 'true';
  
  return NextResponse.json({
    isAdmin: isAuthenticated,
    isAuthenticated
  });
} 