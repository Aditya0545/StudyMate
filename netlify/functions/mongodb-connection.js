const { MongoClient } = require('mongodb');
const { builder } = require('@netlify/functions');

// Cached connection
let cachedDb = null;

/**
 * Connect to MongoDB database
 * @returns {Promise<import('mongodb').Db>} MongoDB database instance
 */
async function connectToDatabase() {
  // If the connection is already established, return the cached connection
  if (cachedDb) {
    return cachedDb;
  }

  // Check if MongoDB URI is set
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  // Connect to MongoDB
  try {
    // Use MongoClient directly to reduce function size
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('studymate');
    
    // Cache the database connection and return it
    cachedDb = db;
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error(`Error connecting to MongoDB: ${error.message}`);
  }
}

/**
 * Handler function for MongoDB connection testing
 */
async function handler(event, context) {
  try {
    const db = await connectToDatabase();
    
    // Test connection by getting collection names
    const collections = await db.listCollections().toArray();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'success',
        message: 'Connected to MongoDB successfully',
        collections: collections.map(c => c.name)
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: error.message
      })
    };
  }
}

// Export functions
module.exports = {
  connectToDatabase,
  handler: builder(handler)
}; 