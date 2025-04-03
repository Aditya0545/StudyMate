import { NextResponse } from 'next/server';

export async function GET() {
  // Don't log or return the actual values, just check if they exist
  const envCheck = {
    node_env: process.env.NODE_ENV || 'not set',
    mongodb_uri_exists: !!process.env.MONGODB_URI,
    mongodb_uri_length: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
    mongodb_uri_starts_with: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 12) : 'not set',
    resources_password_exists: !!process.env.RESOURCES_PASSWORD,
    vercel_env: process.env.VERCEL_ENV || 'not set',
    timestamp: new Date().toISOString(),
    runtime: typeof window === 'undefined' ? 'server' : 'client'
  };

  return NextResponse.json(envCheck);
} 