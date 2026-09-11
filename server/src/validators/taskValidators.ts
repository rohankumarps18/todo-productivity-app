import { TASK_PRIORITIES, TASK_STATUSES, type TaskPriority, type TaskStatus } from "../models/Task";
import type { ValidationResult } from "./authValidators";

export interface TaskInput {
  title?: unknown;
  description?: unknown;
  dateTime?: unknown;
  deadline?: unknown;
  priority?: unknown;
  status?: unknown;
}

function isValidDateInput(value: unknown): value is string | number {
  if (typeof value !== "string" && typeof value !== "number") return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

/**
 * Validates a task create/update payload. `partial` allows PUT-style
 * updates where only some fields are present; `title`/`dateTime`/`deadline`
 * are still required on create (partial = false).
 */
export function validateTaskInput(body: TaskInput, partial = false): ValidationResult {
  const errors: string[] = [];

  const hasTitle = body.title !== undefined;
  if (!partial || hasTitle) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      errors.push("Title is required.");
    } else if (body.title.length > 200) {
      errors.push("Title must be 200 characters or fewer.");
    }
  }

  if (body.description !== undefined && typeof body.description !== "string") {
    errors.push("Description must be a string.");
  }

  const hasDateTime = body.dateTime !== undefined;
  if (!partial || hasDateTime) {
    if (!isValidDateInput(body.dateTime)) {
      errors.push("A valid dateTime is required.");
    }
  }

  const hasDeadline = body.deadline !== undefined;
  if (!partial || hasDeadline) {
    if (!isValidDateInput(body.deadline)) {
      errors.push("A valid deadline is required.");
    }
  }

  // Only compare dateTime vs deadline if both are present and individually
  // valid, otherwise we'd be comparing against an Invalid Date.
  if (isValidDateInput(body.dateTime) && isValidDateInput(body.deadline)) {
    const dateTime = new Date(body.dateTime).getTime();
    const deadline = new Date(body.deadline).getTime();
    if (deadline < dateTime) {
      errors.push("Deadline cannot be before the task's date/time.");
    }
  }

  if (body.priority !== undefined && !TASK_PRIORITIES.includes(body.priority as TaskPriority)) {
    errors.push(`Priority must be one of: ${TASK_PRIORITIES.join(", ")}.`);
  }

  if (body.status !== undefined && !TASK_STATUSES.includes(body.status as TaskStatus)) {
    errors.push(`Status must be one of: ${TASK_STATUSES.join(", ")}.`);
  }

  return { valid: errors.length === 0, errors };
}
