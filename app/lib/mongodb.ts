import { MongoClient } from 'mongodb';

// Environment detection
const isDev = process.env.NODE_ENV !== 'production';
console.log('MongoDB Client Environment:', process.env.NODE_ENV);
console.log('Creating MongoDB client in', isDev ? 'development' : 'production', 'mode');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'studymate';

// Check the MongoDB URI
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global MongoDB client promise
let cachedClient: MongoClient;
let cachedDb: any;

/**
 * Global promise for the MongoDB client
 */
let clientPromise: Promise<MongoClient> = (async function() {
  // In development mode, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement).
  if (isDev) {
    // @ts-ignore
    if (!global._mongoClientPromise) {
      console.log('Initializing MongoDB client');
      const client = new MongoClient(MONGODB_URI);
      // @ts-ignore
      global._mongoClientPromise = client.connect();
    }
    // @ts-ignore
    return global._mongoClientPromise;
  }

  // In production mode, create a new client for each connection
  console.log('Initializing MongoDB client');
  const client = new MongoClient(MONGODB_URI);
  return client.connect();
})();

export default clientPromise; 