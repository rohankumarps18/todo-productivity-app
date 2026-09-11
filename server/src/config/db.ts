import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(): Promise<void> {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is not set.");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongodbUri, {
    // Fail fast on a bad/unreachable URI instead of hanging on Mongoose's
    // 30s default - much easier to diagnose during local setup.
    serverSelectionTimeoutMS: 8000,
  });

  mongoose.connection.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error:", err);
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
