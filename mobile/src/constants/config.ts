import { Platform } from "react-native";

/**
 * The Android emulator can't reach the host machine's "localhost" - it
 * needs the special alias 10.0.2.2. A real device needs your machine's
 * actual LAN IP instead. Override via this single constant rather than
 * hunting through the codebase when you switch between emulator/device.
 */
const DEV_HOST = Platform.select({ android: "10.0.2.2", default: "localhost" });

export const API_BASE_URL = `http://${DEV_HOST}:8000/api`;

export const STORAGE_KEYS = {
  authToken: "@todo_productivity/auth_token",
  authUser: "@todo_productivity/auth_user",
} as const;
