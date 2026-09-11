import { Schema, model, Types } from "mongoose";

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = ["PENDING", "COMPLETED"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface ITask {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  dateTime: Date;
  deadline: Date;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    dateTime: { type: Date, required: true },
    deadline: { type: Date, required: true },
    priority: { type: String, enum: TASK_PRIORITIES, required: true, default: "MEDIUM" },
    status: { type: String, enum: TASK_STATUSES, required: true, default: "PENDING" },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, deadline: 1 });

export const Task = model<ITask>("Task", taskSchema);
