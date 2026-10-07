import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  var mongooseConnection:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseConnection || {
  conn: null,
  promise: null,
};

global.mongooseConnection = cached;

export async function connectMongoDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local or the hosting environment."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: "aerospaceos",
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}