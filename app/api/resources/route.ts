import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { getVideoMetadata } from '@/app/lib/youtube';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

interface UrlMetadata {
  type: string;  // 'youtube', 'gdocs', 'gsheets', 'gslides', 'gdrive', 'other'
  title?: string;
  description?: string;
  thumbnail?: string;
  author?: string;
  publishedAt?: string;
}

// Helper function to check admin password
const checkAdminPassword = (request: Request): boolean => {
  const adminPassword = request.headers.get('X-Admin-Password');
  return adminPassword === process.env.RESOURCES_PASSWORD;
};

// GET doesn't require authentication - public access
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const db = await connectToDatabase();
    const collection = db.collection('resources');
    
    if (id) {
      const resource = await collection.findOne({ _id: new ObjectId(id) });
      if (!resource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }
      return NextResponse.json(resource);
    }
    
    const resources = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error in GET /api/resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check admin password
    if (!checkAdminPassword(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in as admin' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection('resources');
    
    const resourceToInsert = {
      ...data,
      createdAt: new Date().toISOString()
    };
    
    const result = await collection.insertOne(resourceToInsert);
    
    return NextResponse.json({
      success: true,
      _id: result.insertedId,
      ...resourceToInsert
    });
  } catch (error) {
    console.error('Error in POST /api/resources:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create resource' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Check admin password
    if (!checkAdminPassword(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in as admin' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    const db = await connectToDatabase();
    const collection = db.collection('resources');
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error in PUT /api/resources:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Check admin password
    if (!checkAdminPassword(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in as admin' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    const collection = db.collection('resources');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/resources:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete resource' },
      { status: 500 }
    );
  }
}

// Helper function to get URL metadata based on URL type
async function getUrlMetadata(url: string): Promise<UrlMetadata | null> {
  if (!url) return null;
  
  try {
    // Check for YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoMetadata = await getVideoMetadata(url);
      if (videoMetadata) {
        return {
          type: 'youtube',
          title: videoMetadata.title,
          description: videoMetadata.description,
          thumbnail: videoMetadata.thumbnail,
          author: videoMetadata.channelTitle,
          publishedAt: videoMetadata.publishedAt
        };
      }
    }
    
    // Check for Google Docs
    if (url.includes('docs.google.com')) {
      return { 
        type: 'gdocs',
        title: 'Google Document'
      };
    }
    
    // Check for Google Sheets
    if (url.includes('sheets.google.com')) {
      return { 
        type: 'gsheets',
        title: 'Google Spreadsheet'
      };
    }
    
    // Check for Google Slides
    if (url.includes('slides.google.com')) {
      return { 
        type: 'gslides',
        title: 'Google Presentation'
      };
    }
    
    // Check for Google Drive
    if (url.includes('drive.google.com')) {
      return { 
        type: 'gdrive',
        title: 'Google Drive File'
      };
    }
    
    // Default type for other URLs
    return { 
      type: 'other',
      title: url.split('//')[1]?.split('/')[0] || url // Use domain as the title
    };
  } catch (error) {
    console.error('Error determining URL type:', error);
    // Return a generic type if we can't determine
    return { 
      type: 'other',
      title: url.split('//')[1]?.split('/')[0] || url
    };
  }
} 