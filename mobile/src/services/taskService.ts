import { apiClient } from "./apiClient";
import type {
  ApiSuccess,
  CreateTaskInput,
  Insights,
  Task,
  TaskSortMode,
  UpdateTaskInput,
} from "../types/api";

export async function fetchTasks(sort: TaskSortMode = "smart"): Promise<Task[]> {
  const res = await apiClient.get<ApiSuccess<Task[]>>("/tasks", { params: { sort } });
  return res.data.data;
}

export async function fetchTaskById(id: string): Promise<Task> {
  const res = await apiClient.get<ApiSuccess<Task>>(`/tasks/${id}`);
  return res.data.data;
}

export async function createTaskRequest(input: CreateTaskInput): Promise<Task> {
  const res = await apiClient.post<ApiSuccess<Task>>("/tasks", input);
  return res.data.data;
}

export async function updateTaskRequest(id: string, input: UpdateTaskInput): Promise<Task> {
  const res = await apiClient.put<ApiSuccess<Task>>(`/tasks/${id}`, input);
  return res.data.data;
}

export async function completeTaskRequest(id: string): Promise<Task> {
  const res = await apiClient.patch<ApiSuccess<Task>>(`/tasks/${id}/complete`);
  return res.data.data;
}

export async function deleteTaskRequest(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

export async function fetchInsights(): Promise<Insights> {
  const res = await apiClient.get<ApiSuccess<Insights>>("/tasks/insights");
  return res.data.data;
}
