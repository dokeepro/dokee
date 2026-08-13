import mongoose from "mongoose";
import { MONGODB_URI } from "@/lib/env";

type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

// Reuse the connection across hot reloads (dev) and warm serverless invocations
// (prod) so we never open a new pool on every request.
const globalWithMongoose = global as typeof globalThis & { _mongoose?: MongooseCache };
const cached: MongooseCache = globalWithMongoose._mongoose ?? { conn: null, promise: null };
globalWithMongoose._mongoose = cached;

export async function dbConnect(): Promise<typeof mongoose> {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI as string, {
            bufferCommands: false,
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
