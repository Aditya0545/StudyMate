import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET - Fetch all lockers or verify locker access
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const password = searchParams.get('password')
    const { db } = await connectToDatabase()
    const collection = db.collection('lockers')

    // If ID and password are provided, verify locker access
    if (id && password) {
      const locker = await collection.findOne({ _id: new ObjectId(id) })
      
      if (!locker) {
        return NextResponse.json(
          { error: 'Locker not found' },
          { status: 404 }
        )
      }

      if (locker.password !== password) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }

      // Return locker details without password
      const { password: _, ...lockerData } = locker
      return NextResponse.json(lockerData)
    }
    
    // Otherwise, fetch all lockers
    const lockers = await collection.find({}).sort({ createdAt: -1 }).toArray()
    
    // Remove passwords from response
    const sanitizedLockers = lockers.map(({ password, ...rest }) => rest)
    
    return NextResponse.json(sanitizedLockers)
  } catch (error) {
    console.error('Error in GET /api/lockers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lockers' },
      { status: 500 }
    )
  }
}

// POST - Create a new locker
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.name || !data.password) {
      return NextResponse.json(
        { error: 'Locker name and password are required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('lockers')
    
    const lockerToInsert = {
      name: data.name,
      password: data.password,
      createdAt: new Date().toISOString()
    }
    
    const result = await collection.insertOne(lockerToInsert)
    
    // Remove password from response
    const { password, ...responseData } = lockerToInsert
    
    return NextResponse.json({
      success: true,
      _id: result.insertedId,
      ...responseData
    })
  } catch (error) {
    console.error('Error in POST /api/lockers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create locker' },
      { status: 500 }
    )
  }
}

// PUT - Update a locker
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const currentPassword = searchParams.get('currentPassword')
    
    if (!id || !currentPassword) {
      return NextResponse.json(
        { error: 'Locker ID and current password are required' },
        { status: 400 }
      )
    }

    const data = await request.json()
    
    const { db } = await connectToDatabase()
    const collection = db.collection('lockers')
    
    // First verify the current password
    const locker = await collection.findOne({ _id: new ObjectId(id) })
    if (!locker || locker.password !== currentPassword) {
      return NextResponse.json(
        { error: 'Invalid current password' },
        { status: 401 }
      )
    }
    
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.newPassword) updateData.password = data.newPassword
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Locker not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/lockers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update locker' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a locker
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const password = searchParams.get('password')
    
    if (!id || !password) {
      return NextResponse.json(
        { error: 'Locker ID and password are required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('lockers')
    
    // First verify the password
    const locker = await collection.findOne({ _id: new ObjectId(id) })
    if (!locker || locker.password !== password) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Locker not found' },
        { status: 404 }
      )
    }
    
    // Also delete all resources associated with this locker
    const resourcesCollection = db.collection('private-resources')
    await resourcesCollection.deleteMany({ lockerId: id })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/lockers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete locker' },
      { status: 500 }
    )
  }
} 