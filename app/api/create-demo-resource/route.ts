import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET() {
  try {
    console.log('Connecting to MongoDB to create demo resource...');
    const db = await connectToDatabase();
    
    // Check if resources collection exists
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('resources')) {
      console.log('Creating resources collection...');
      await db.createCollection('resources');
    }
    
    // Check if we already have resources
    const count = await db.collection('resources').countDocuments();
    console.log(`Found ${count} existing resources`);
    
    if (count === 0) {
      // Create a demo resource
      const demoResource = {
        title: 'Welcome to test!',
        description: 'This is a demo resource to help you get started with test.',
        type: 'note',
        content: '# Welcome to test!\n\nThis is a demo resource created automatically. You can create more resources by clicking the "Add New" button in the resources page.\n\n## Features\n\n- Add different types of resources (notes, links, videos, documents)\n- Organize with tags and categories\n- Search and filter your resources\n- Light and dark mode support',
        tags: ['demo', 'getting-started'],
        category: 'General',
        createdAt: new Date()
      };
      
      console.log('Inserting demo resource...');
      const result = await db.collection('resources').insertOne(demoResource);
      
      return NextResponse.json({
        success: true,
        message: 'Demo resource created successfully',
        resourceId: result.insertedId
      });
    } else {
      return NextResponse.json({
        success: true,
        message: `Resources already exist (${count} found)`,
        resourceCount: count
      });
    }
  } catch (error) {
    console.error('Error creating demo resource:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 