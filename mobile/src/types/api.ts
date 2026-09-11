export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "COMPLETED";
export type UrgencyLabel = "OVERDUE" | "CRITICAL" | "DUE SOON" | "ON TRACK" | "LOW URGENCY";

export interface Urgency {
  score: number;
  label: UrgencyLabel;
  reason: string;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  dateTime: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  urgency: Urgency;
}

export type TaskSortMode = "smart" | "deadline" | "priority" | "newest" | "completed";

export interface CreateTaskInput {
  title: string;
  description?: string;
  dateTime: string;
  deadline: string;
  priority?: TaskPriority;
}

export type UpdateTaskInput = Partial<CreateTaskInput> & { status?: TaskStatus };

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Insights {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  highPriorityCompleted: number;
  completedToday: number;
  createdToday: number;
  averageCompletionTimeMs: number | null;
  hasEnoughDataForAverage: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
}
