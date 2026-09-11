import { Schema, model, type HydratedDocument, type Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    passwordHash: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.methods.comparePassword = async function comparePassword(
  this: HydratedDocument<IUser, IUserMethods>,
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const SALT_ROUNDS = 10;

export const User = model<IUser, UserModel>("User", userSchema);
