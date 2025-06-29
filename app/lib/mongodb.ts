import { MongoClient, ServerApiVersion, Db } from 'mongodb';

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
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch(err => {
      console.error('Failed to connect to MongoDB in development:', err);
      throw err;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch(err => {
    console.error('Failed to connect to MongoDB in production:', err);
    throw err;
  });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Helper function to connect to database and return Db instance
export async function connectToDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('test');
} 