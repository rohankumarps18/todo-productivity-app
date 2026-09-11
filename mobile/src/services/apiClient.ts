import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../constants/config";
import { useAuthStore } from "../store/authStore";
import type { ApiFailure } from "../types/api";

export class ApiRequestError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Attach the JWT to every request once the user is logged in. Reading from
// the store directly (rather than passing the token around everywhere)
// keeps every service function simple.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize every failure into ApiRequestError with the backend's actual
// message, so screens never have to reach into axios's response shape.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiFailure>) => {
    if (error.response) {
      const message = error.response.data?.message ?? "Something went wrong. Please try again.";
      const apiError = new ApiRequestError(message, error.response.status);

      // A 401 on an authenticated request means the token is invalid or
      // expired - log the user out so the UI drops back to the login
      // screen instead of silently failing on every subsequent request.
      if (error.response.status === 401) {
        useAuthStore.getState().logout();
      }

      return Promise.reject(apiError);
    }

    if (error.request) {
      return Promise.reject(
        new ApiRequestError("Couldn't reach the server. Check your connection and try again.")
      );
    }

    return Promise.reject(new ApiRequestError(error.message || "Unexpected error."));
  }
);
