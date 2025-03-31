const { MongoClient } = require('mongodb');
const { builder } = require('@netlify/functions');

// Cached connection
let cachedDb = null;
let client = null;

/**
 * Connect to MongoDB database
 * @returns {Promise<import('mongodb').Db>} MongoDB database instance
 */
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not set');
  }

  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    cachedDb = client.db('studymate');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB error:', error);
    throw error;
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
        status: 'ok',
        collections: collections.map(c => c.name)
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

// Export functions
module.exports = {
  connectToDatabase,
  handler: builder(handler)
}; 