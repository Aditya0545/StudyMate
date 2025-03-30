import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI (redacted):', process.env.MONGODB_URI?.substring(0, 15) + '...');
    
    // Test connection
    const client = await clientPromise;
    const db = client.db('studymate');
    
    // Check if we can connect and perform a simple operation
    const dbInfo = await db.command({ ping: 1 });
    
    // Get collection stats
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    // If we have a resources collection, get count
    let resourceCount = 0;
    if (collectionNames.includes('resources')) {
      resourceCount = await db.collection('resources').countDocuments();
    }
    
    return NextResponse.json({
      status: 'success',
      connected: true,
      ping: dbInfo.ok === 1 ? 'success' : 'failed',
      database: 'studymate',
      collections: collectionNames,
      resourceCount,
      note: 'Connection to MongoDB successful!'
    });
  } catch (error) {
    console.error('MongoDB Connection Test Error:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({
      status: 'error',
      connected: false,
      error: errorMessage,
      uri: process.env.MONGODB_URI ? 'URI is set' : 'URI is missing',
      note: 'Please check your MongoDB connection string in your environment variables.'
    }, { status: 500 });
  }
} 