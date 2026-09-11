import mongoose from "mongoose";
export const hasTestDatabase = Boolean(process.env.MONGODB_URI);

export async function connectTestDb(): Promise<void> {
  if (!process.env.MONGODB_URI) return;
  await mongoose.connect(process.env.MONGODB_URI);
}

export async function clearTestDb(): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

export async function disconnectTestDb(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
