import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { MongoClient } from 'mongodb';

export async function GET() {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodbUri: process.env.MONGODB_URI ? 'Set (redacted)' : 'Not set',
    connection: 'Unknown',
    collections: [],
    errors: [],
  };

  try {
    console.log('[DEBUG] Testing MongoDB connection...');
    
    // Test connection
    let client: MongoClient;
    try {
      console.log('[DEBUG] Attempting to connect to MongoDB...');
      client = await clientPromise;
      debugInfo.connection = 'Connected';
      console.log('[DEBUG] Connection to MongoDB successful');
    } catch (error) {
      console.error('[DEBUG] MongoDB Connection Error:', error);
      debugInfo.connection = 'Failed';
      debugInfo.connectionError = error instanceof Error ? error.message : String(error);
      debugInfo.errors.push({
        stage: 'connection',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      // Return early with the connection error
      return NextResponse.json(debugInfo);
    }
    
    // Now try database operations
    try {
      console.log('[DEBUG] Accessing database...');
      const db = client.db('test');
      debugInfo.database = 'test';
      
      // Try a ping to verify connection
      try {
        console.log('[DEBUG] Pinging database...');
        const ping = await db.command({ ping: 1 });
        debugInfo.ping = ping.ok === 1 ? 'success' : 'failed';
        console.log('[DEBUG] Database ping result:', ping);
      } catch (error) {
        console.error('[DEBUG] Database ping error:', error);
        debugInfo.ping = 'error';
        debugInfo.errors.push({
          stage: 'ping',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
      
      // Try listing collections
      try {
        console.log('[DEBUG] Listing collections...');
        const collections = await db.listCollections().toArray();
        debugInfo.collections = collections.map(col => col.name);
        console.log('[DEBUG] Collections found:', debugInfo.collections);
      } catch (error) {
        console.error('[DEBUG] Error listing collections:', error);
        debugInfo.errors.push({
          stage: 'list_collections',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
      
      // Try resources collection operations
      if (debugInfo.collections.includes('resources')) {
        try {
          console.log('[DEBUG] Counting resources...');
          const count = await db.collection('resources').countDocuments();
          debugInfo.resourceCount = count;
          console.log('[DEBUG] Resources count:', count);
          
          // Try getting one resource
          if (count > 0) {
            try {
              console.log('[DEBUG] Fetching one resource...');
              const resource = await db.collection('resources').findOne({});
              debugInfo.sampleResource = {
                id: resource?._id,
                hasTitle: !!resource?.title,
                type: resource?.type,
                fields: resource ? Object.keys(resource) : []
              };
              console.log('[DEBUG] Sample resource fields:', debugInfo.sampleResource.fields);
            } catch (error) {
              console.error('[DEBUG] Error fetching sample resource:', error);
              debugInfo.errors.push({
                stage: 'fetch_sample',
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              });
            }
          }
        } catch (error) {
          console.error('[DEBUG] Error counting resources:', error);
          debugInfo.errors.push({
            stage: 'count_resources',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
        }
      }
      
    } catch (error) {
      console.error('[DEBUG] General database error:', error);
      debugInfo.errors.push({
        stage: 'database_operations',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  } catch (error) {
    console.error('[DEBUG] Unexpected error in debug endpoint:', error);
    debugInfo.errors.push({
      stage: 'unexpected',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
  
  return NextResponse.json(debugInfo);
} 