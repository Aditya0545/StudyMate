const { MongoClient } = require('mongodb');

// Cached connection
let cachedDb = null;

async function connectToDatabase() {
  // If the connection is already established, return the cached connection
  if (cachedDb) {
    return cachedDb;
  }

  // Connect to MongoDB
  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db('studymate');
  
  // Cache the database connection and return it
  cachedDb = db;
  return db;
}

module.exports = { connectToDatabase }; 