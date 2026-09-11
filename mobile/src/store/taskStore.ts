import { create } from "zustand";
import {
  completeTaskRequest,
  createTaskRequest,
  deleteTaskRequest,
  fetchTasks,
  updateTaskRequest,
} from "../services/taskService";
import type { CreateTaskInput, Task, TaskSortMode, UpdateTaskInput } from "../types/api";

interface TaskState {
  tasks: Task[];
  sortMode: TaskSortMode;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;

  loadTasks: (sort?: TaskSortMode) => Promise<void>;
  setSortMode: (sort: TaskSortMode) => void;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<Task>;
  /** Optimistic: flips the task to COMPLETED in the UI immediately, then
   * confirms with the server. On failure, restores the previous task. */
  completeTask: (id: string) => Promise<void>;
  /** Optimistic: removes the task from the UI immediately. On failure,
   * puts it back in its original position. */
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  sortMode: "smart",
  status: "idle",
  error: null,

  loadTasks: async (sort) => {
    const sortMode = sort ?? get().sortMode;
    set({ status: "loading", error: null, sortMode });
    try {
      const tasks = await fetchTasks(sortMode);
      set({ tasks, status: "success" });
    } catch (err) {
      set({ status: "error", error: err instanceof Error ? err.message : "Failed to load tasks." });
    }
  },

  setSortMode: (sort) => {
    set({ sortMode: sort });
    get().loadTasks(sort).catch(() => {
      // loadTasks already sets `error`/`status` internally on failure -
      // nothing further to do with the rejection here.
    });
  },

  createTask: async (input) => {
    const created = await createTaskRequest(input);
    set((state) => ({ tasks: [created, ...state.tasks] }));
    return created;
  },

  updateTask: async (id, input) => {
    const updated = await updateTaskRequest(id, input);
    set((state) => ({ tasks: state.tasks.map((t) => (t._id === id ? updated : t)) }));
    return updated;
  },

  completeTask: async (id) => {
    const previous = get().tasks;
    const target = previous.find((t) => t._id === id);
    if (!target) return;

    set({
      tasks: previous.map((t) =>
        t._id === id ? { ...t, status: "COMPLETED", completedAt: new Date().toISOString() } : t
      ),
    });

    try {
      const confirmed = await completeTaskRequest(id);
      set((state) => ({ tasks: state.tasks.map((t) => (t._id === id ? confirmed : t)) }));
    } catch (err) {
      // Roll back to exactly what the server last confirmed.
      set({
        tasks: previous,
        error: err instanceof Error ? err.message : "Couldn't mark the task complete. Please try again.",
      });
      throw err;
    }
  },

  deleteTask: async (id) => {
    const previous = get().tasks;
    const index = previous.findIndex((t) => t._id === id);
    if (index === -1) return;

    set({ tasks: previous.filter((t) => t._id !== id) });

    try {
      await deleteTaskRequest(id);
    } catch (err) {
      set({
        tasks: previous,
        error: err instanceof Error ? err.message : "Couldn't delete the task. Please try again.",
      });
      throw err;
    }
  },
}));
