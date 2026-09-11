import { useCallback, useEffect, useState } from "react";
import { fetchTaskById } from "../services/taskService";
import { useTaskStore } from "../store/taskStore";
import type { Task } from "../types/api";

interface UseTaskResult {
  task: Task | null;
  status: "loading" | "success" | "error";
  error: string | null;
  refetch: () => void;
}

/**
 * Reads the task from the task store first (instant, since the dashboard
 * already has it), then confirms with a real GET /api/tasks/:id so the
 * details/edit screens never show data that's gone stale relative to the
 * server. If the store copy is missing (e.g. after a fresh app restart
 * mid-navigation), this is the only source of the task.
 */
export function useTask(taskId: string): UseTaskResult {
  const cached = useTaskStore((s) => s.tasks.find((t) => t._id === taskId) ?? null);
  const [task, setTask] = useState<Task | null>(cached);
  const [status, setStatus] = useState<"loading" | "success" | "error">(cached ? "success" : "loading");
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setStatus((prev) => (prev === "success" ? "success" : "loading"));
    fetchTaskById(taskId)
      .then((fresh) => {
        setTask(fresh);
        setStatus("success");
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load this task.");
        setStatus((prev) => (prev === "success" ? "success" : "error"));
      });
  }, [taskId]);

  useEffect(() => {
    refetch();
    // Only re-run when the ID changes - refetch itself is stable per ID.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  useEffect(() => {
    if (cached) setTask(cached);
  }, [cached]);

  return { task, status, error, refetch };
}
