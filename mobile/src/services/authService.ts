import { apiClient } from "./apiClient";
import type { ApiSuccess, AuthResponse } from "../types/api";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await apiClient.post<ApiSuccess<AuthResponse>>("/auth/register", payload);
  return res.data.data;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const res = await apiClient.post<ApiSuccess<AuthResponse>>("/auth/login", payload);
  return res.data.data;
}
