import type { Request, Response } from "express";
import type { HydratedDocument } from "mongoose";
import { Task, type ITask } from "../models/Task";
import { validateTaskInput } from "../validators/taskValidators";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { calculateTaskUrgency, sortTasksByUrgency } from "../services/urgencyEngine";

const SORT_MODES = ["smart", "deadline", "priority", "newest", "completed"] as const;
type SortMode = (typeof SORT_MODES)[number];

function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/** Throws 404 (not 403) if the task doesn't belong to this user, so a
 * caller can't distinguish "not yours" from "doesn't exist" by probing IDs. */
async function getOwnedTaskOrThrow(taskId: string, userId: string) {
  if (!isValidObjectId(taskId)) {
    throw ApiError.notFound("Task not found.");
  }
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw ApiError.notFound("Task not found.");
  }
  return task;
}

function serializeWithUrgency(task: HydratedDocument<ITask>) {
  const urgency = calculateTaskUrgency(task);
  return { ...task.toJSON(), urgency };
}

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { valid, errors } = validateTaskInput(req.body, false);
  if (!valid) {
    throw ApiError.badRequest(errors.join(" "));
  }

  const task = await Task.create({
    userId: req.userId,
    title: (req.body.title as string).trim(),
    description: typeof req.body.description === "string" ? req.body.description.trim() : "",
    dateTime: new Date(req.body.dateTime),
    deadline: new Date(req.body.deadline),
    priority: req.body.priority ?? "MEDIUM",
    status: "PENDING",
  });

  sendSuccess(res, 201, serializeWithUrgency(task));
});

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const requestedSort = typeof req.query.sort === "string" ? req.query.sort : "smart";
  const sortMode: SortMode = (SORT_MODES as readonly string[]).includes(requestedSort)
    ? (requestedSort as SortMode)
    : "smart";

  const tasks = await Task.find({ userId: req.userId });

  let ordered: typeof tasks;
  switch (sortMode) {
    case "deadline":
      ordered = [...tasks].sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
      break;
    case "priority": {
      const rank: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      ordered = [...tasks].sort((a, b) => rank[a.priority] - rank[b.priority]);
      break;
    }
    case "newest":
      ordered = [...tasks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "completed":
      ordered = tasks.filter((t) => t.status === "COMPLETED");
      break;
    case "smart":
    default:
      ordered = sortTasksByUrgency(tasks);
      break;
  }

  sendSuccess(res, 200, ordered.map(serializeWithUrgency));
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const task = await getOwnedTaskOrThrow(req.params.id, req.userId!);
  sendSuccess(res, 200, serializeWithUrgency(task));
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { valid, errors } = validateTaskInput(req.body, true);
  if (!valid) {
    throw ApiError.badRequest(errors.join(" "));
  }

  const task = await getOwnedTaskOrThrow(req.params.id, req.userId!);

  const updatable: (keyof ITask)[] = ["title", "description", "dateTime", "deadline", "priority", "status"];
  for (const field of updatable) {
    if (req.body[field] === undefined) continue;
    if (field === "dateTime" || field === "deadline") {
      (task[field] as Date) = new Date(req.body[field]);
    } else {
      (task[field] as unknown) = req.body[field];
    }
  }

  await task.save();
  sendSuccess(res, 200, serializeWithUrgency(task));
});

export const completeTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await getOwnedTaskOrThrow(req.params.id, req.userId!);
  task.status = "COMPLETED";
  task.completedAt = new Date();
  await task.save();
  sendSuccess(res, 200, serializeWithUrgency(task));
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await getOwnedTaskOrThrow(req.params.id, req.userId!);
  await task.deleteOne();
  sendSuccess(res, 200, { deleted: true, id: req.params.id });
});

export const getInsights = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await Task.find({ userId: req.userId });
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED");
  const pending = tasks.filter((t) => t.status === "PENDING");
  const overdue = pending.filter((t) => t.deadline.getTime() < now.getTime());

  const completedToday = completed.filter((t) => t.completedAt !== null && t.completedAt >= startOfToday);
  const createdToday = tasks.filter((t) => t.createdAt >= startOfToday);
  const highPriorityCompleted = completed.filter((t) => t.priority === "HIGH");

  const completionRate = total === 0 ? 0 : Math.round((completed.length / total) * 100);

  const completionDurationsMs = completed
    .filter((t) => t.completedAt !== null)
    .map((t) => t.completedAt!.getTime() - t.createdAt.getTime())
    .filter((ms) => ms >= 0);

  const averageCompletionTimeMs =
    completionDurationsMs.length === 0
      ? null
      : Math.round(completionDurationsMs.reduce((sum, ms) => sum + ms, 0) / completionDurationsMs.length);

  sendSuccess(res, 200, {
    total,
    completed: completed.length,
    pending: pending.length,
    overdue: overdue.length,
    completionRate,
    highPriorityCompleted: highPriorityCompleted.length,
    completedToday: completedToday.length,
    createdToday: createdToday.length,
    averageCompletionTimeMs,
    hasEnoughDataForAverage: completionDurationsMs.length > 0,
  });
});
