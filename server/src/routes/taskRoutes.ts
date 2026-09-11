import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  completeTask,
  createTask,
  deleteTask,
  getInsights,
  getTaskById,
  listTasks,
  updateTask,
} from "../controllers/taskController";

const router = Router();

router.use(requireAuth);

// Registered before "/:id" so "insights" is never mistaken for a task ID.
router.get("/insights", getInsights);

router.post("/", createTask);
router.get("/", listTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.patch("/:id/complete", completeTask);
router.delete("/:id", deleteTask);

export default router;
