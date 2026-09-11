import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.example to .env and fill it in.`
    );
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 8000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isTest: process.env.NODE_ENV === "test",
  mongodbUri: process.env.NODE_ENV === "test" ? process.env.MONGODB_URI : required("MONGODB_URI"),
  jwtSecret: process.env.NODE_ENV === "test" ? (process.env.JWT_SECRET ?? "test-secret") : required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};
