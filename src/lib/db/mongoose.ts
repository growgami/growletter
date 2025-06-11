import mongoose from 'mongoose';

const UPVOTES_MONGODB_URI = process.env.UPVOTES_MONGODB_URI;

if (!UPVOTES_MONGODB_URI) {
  throw new Error('Please define the UPVOTES_MONGODB_URI environment variable inside .env');
}

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseUpvotes: GlobalMongoose | undefined;
}

let cached = global.mongooseUpvotes;

if (!cached) {
  cached = global.mongooseUpvotes = { conn: null, promise: null };
}

async function connectToUpvotesDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(UPVOTES_MONGODB_URI!, opts);
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectToUpvotesDB; 