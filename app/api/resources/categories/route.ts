import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET - Fetch all unique categories
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('resources');
    
    // Get all unique categories from resources
    const categories = await collection.distinct('categories');
    
    return NextResponse.json({
      categories: categories.sort()
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 