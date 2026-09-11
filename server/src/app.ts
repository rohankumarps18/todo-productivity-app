import express, { type Express } from "express";
import cors from "cors";
import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ success: true, data: { status: "ok" } });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/tasks", taskRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
