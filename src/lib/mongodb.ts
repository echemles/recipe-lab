import { MongoClient } from "mongodb";

const options = {};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  const isTestEnvironment =
    process.env.NODE_ENV === "test" || process.env.PLAYWRIGHT_TEST === "true";

  // Use test database only when running Playwright or in test environment
  const uri = isTestEnvironment
    ? (process.env.MONGODB_URI_TEST || process.env.MONGODB_URI)
    : process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export default getClientPromise;
