import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Helper function to check locker password
async function checkLockerPassword(lockerId: string, password: string) {
  const { db } = await connectToDatabase()
  const lockersCollection = db.collection('lockers')
  const locker = await lockersCollection.findOne({ _id: new ObjectId(lockerId) })
  return locker?.password === password
}

// GET - Fetch resources for a specific locker
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lockerId = searchParams.get('lockerId')
    const id = searchParams.get('id')
    const password = request.headers.get('X-Locker-Password')
    
    if (!lockerId || !password) {
      return NextResponse.json(
        { error: 'Locker ID and password are required' },
        { status: 400 }
      )
    }

    // Verify locker password
    const isValid = await checkLockerPassword(lockerId, password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid locker password' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('private-resources')
    
    // If id is provided, fetch single resource
    if (id) {
      const resource = await collection.findOne({
        _id: new ObjectId(id),
        lockerId
      })
      
      if (!resource) {
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(resource)
    }
    
    // Otherwise fetch all resources for the locker
    const resources = await collection
      .find({ lockerId })
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json(resources)
  } catch (error) {
    console.error('Error in GET /api/private-resources:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch private resources' },
      { status: 500 }
    )
  }
}

// POST - Create a new private resource
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lockerId = searchParams.get('lockerId')
    const password = request.headers.get('X-Locker-Password')
    
    if (!lockerId || !password) {
      return NextResponse.json(
        { error: 'Locker ID and password are required' },
        { status: 400 }
      )
    }

    // Verify locker password
    const isValid = await checkLockerPassword(lockerId, password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid locker password' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('private-resources')
    
    const resourceToInsert = {
      ...data,
      lockerId,
      createdAt: new Date().toISOString()
    }
    
    const result = await collection.insertOne(resourceToInsert)
    
    return NextResponse.json({
      success: true,
      _id: result.insertedId,
      ...resourceToInsert
    })
  } catch (error) {
    console.error('Error in POST /api/private-resources:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create private resource' },
      { status: 500 }
    )
  }
}

// PUT - Update a private resource
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const lockerId = searchParams.get('lockerId')
    const password = request.headers.get('X-Locker-Password')
    
    if (!id || !lockerId || !password) {
      return NextResponse.json(
        { error: 'Resource ID, locker ID, and password are required' },
        { status: 400 }
      )
    }

    // Verify locker password
    const isValid = await checkLockerPassword(lockerId, password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid locker password' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    const { db } = await connectToDatabase()
    const collection = db.collection('private-resources')
    
    // Ensure we're not modifying the lockerId
    const { _id, lockerId: _, ...updateData } = data
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id), lockerId },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date().toISOString()
        } 
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/private-resources:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update private resource' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a private resource
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const lockerId = searchParams.get('lockerId')
    const password = request.headers.get('X-Locker-Password')
    
    if (!id || !lockerId || !password) {
      return NextResponse.json(
        { error: 'Resource ID, locker ID, and password are required' },
        { status: 400 }
      )
    }

    // Verify locker password
    const isValid = await checkLockerPassword(lockerId, password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid locker password' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('private-resources')
    
    const result = await collection.deleteOne({ 
      _id: new ObjectId(id), 
      lockerId 
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/private-resources:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete private resource' },
      { status: 500 }
    )
  }
} 