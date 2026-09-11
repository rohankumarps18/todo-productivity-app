import SplashScreen from "../screens/SplashScreen";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import { useAuthStore } from "../store/authStore";

/**
 * Not a navigator with routes of its own - just picks which stack to mount
 * based on real auth state (isHydrated / token), read directly from the
 * store. No fake "always logged in" shortcut and no placeholder screens:
 * until hydrate() (called from SplashScreen) resolves, we show Splash;
 * after that, Auth or App depending on whether a token was restored.
 */
export default function RootNavigator() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);

  if (!isHydrated) {
    return <SplashScreen />;
  }

  return token ? <AppNavigator /> : <AuthNavigator />;
}
