import { NextResponse } from 'next/server';

export async function GET() {
  const adminPassword = process.env.RESOURCES_PASSWORD;
  
  return NextResponse.json({
    isConfigured: !!adminPassword,
    message: adminPassword ? 'Admin password is configured' : 'Admin password is not configured'
  });
} 