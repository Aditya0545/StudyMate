import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    const db = await connectToDatabase();
    
    // Try to ping the database
    await db.command({ ping: 1 });
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB',
      database: db.databaseName
    });
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      mongodbUri: process.env.MONGODB_URI ? 'Set (but might be invalid)' : 'Not set'
    }, { status: 500 });
  }
} 