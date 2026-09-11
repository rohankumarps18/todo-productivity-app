import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/config";
import { loginRequest, registerRequest, type LoginPayload, type RegisterPayload } from "../services/authService";
import type { User } from "../types/api";

interface AuthState {
  user: User | null;
  token: string | null;
  /** True once we've checked AsyncStorage for a saved session, so the
   * splash screen knows when it's safe to decide where to navigate. */
  isHydrated: boolean;
  isSubmitting: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,
  isSubmitting: false,
  error: null,

  hydrate: async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.authToken),
        AsyncStorage.getItem(STORAGE_KEYS.authUser),
      ]);
      set({
        token: token ?? null,
        user: userJson ? (JSON.parse(userJson) as User) : null,
        isHydrated: true,
      });
    } catch {
      // A corrupted/unreadable cache shouldn't crash the app - just start
      // logged out, same as a first launch.
      set({ token: null, user: null, isHydrated: true });
    }
  },

  login: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const { user, token } = await loginRequest(payload);
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.authToken, token),
        AsyncStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(user)),
      ]);
      set({ user, token, isSubmitting: false });
    } catch (err) {
      set({ isSubmitting: false, error: err instanceof Error ? err.message : "Login failed." });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const { user, token } = await registerRequest(payload);
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.authToken, token),
        AsyncStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(user)),
      ]);
      set({ user, token, isSubmitting: false });
    } catch (err) {
      set({ isSubmitting: false, error: err instanceof Error ? err.message : "Registration failed." });
      throw err;
    }
  },

  logout: () => {
    AsyncStorage.removeMany([STORAGE_KEYS.authToken, STORAGE_KEYS.authUser]).catch(() => {
      // Best-effort cleanup - even if this fails, clearing in-memory state
      // below immediately logs the user out of the current session.
    });
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
