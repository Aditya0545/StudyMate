import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { getVideoMetadata } from '@/app/lib/youtube';
import { auth } from '@/app/lib/firebase';
import { ObjectId } from 'mongodb';

interface UrlMetadata {
  type: string;  // 'youtube', 'gdocs', 'gsheets', 'gslides', 'gdrive', 'other'
  title?: string;
  description?: string;
  thumbnail?: string;
  author?: string;
  publishedAt?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const client = await clientPromise;
    const db = client.db('studymate');
    const resources = db.collection('resources');
    
    // If ID is provided, return a single resource
    if (id) {
      try {
        const objectId = new ObjectId(id);
        const resource = await resources.findOne({ _id: objectId });
        
        if (!resource) {
          return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }
        
        return NextResponse.json(resource);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid resource ID' }, { status: 400 });
      }
    }
    
    // Otherwise, handle filters for multiple resources
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    
    // Build the query
    let query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (search) {
      // Search in title and description
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const result = await resources.find(query).toArray();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('studymate');
    const resources = db.collection('resources');
    
    const data = await request.json();
    
    // Detect URL type and fetch metadata
    if (data.url) {
      data.urlMetadata = await getUrlMetadata(data.url);
      
      // Use metadata for title/description if not provided
      if (data.urlMetadata) {
        if (!data.title && data.urlMetadata.title) {
          data.title = data.urlMetadata.title;
        }
        
        if (!data.description && data.urlMetadata.description) {
          data.description = data.urlMetadata.description;
        }
      }
    }
    
    // Add timestamp and user info
    data.createdAt = new Date();
    // data.userId = auth.currentUser?.uid; // Add user ID when auth is implemented
    
    const result = await resources.insertOne(data);
    
    return NextResponse.json({
      _id: result.insertedId,
      ...data
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing resource ID' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('studymate');
    const resources = db.collection('resources');
    
    const data = await request.json();
    
    // Detect URL type and fetch metadata if URL has changed
    if (data.url) {
      data.urlMetadata = await getUrlMetadata(data.url);
    }
    
    // Add update timestamp
    data.updatedAt = new Date();
    
    // Remove id from the data object
    const { id: _, ...updateData } = data;
    
    try {
      const objectId = new ObjectId(id);
      const result = await resources.updateOne(
        { _id: objectId },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        _id: id,
        ...updateData
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing resource ID' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('studymate');
    const resources = db.collection('resources');
    
    try {
      const objectId = new ObjectId(id);
      const result = await resources.deleteOne({ _id: objectId });
      
      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
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