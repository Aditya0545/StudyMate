import { MongoClient, ServerApiVersion } from 'mongodb';

// Log MongoDB connection attempt for debugging purposes
console.log('Initializing MongoDB client');

if (!process.env.MONGODB_URI) {
  console.error('MongoDB URI is missing. Please add it to environment variables.');
}

const uri = process.env.MONGODB_URI || '';
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Add these options for better compatibility with serverless environments
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 15000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
};

// Global MongoDB client variable for connection pooling across serverless functions
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

console.log(`MongoDB Client Environment: ${process.env.NODE_ENV}`);

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    console.log('Creating new MongoDB client in development mode');
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch(err => {
      console.error('Failed to connect to MongoDB in development:', err);
      throw err;
    });
  } else {
    console.log('Reusing existing MongoDB client in development mode');
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, create a new client for each connection
  console.log('Creating MongoDB client in production mode');
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch(err => {
    console.error('Failed to connect to MongoDB in production:', err);
    throw err;
  });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 