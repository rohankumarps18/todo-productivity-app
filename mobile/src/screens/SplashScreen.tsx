import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LoadingState } from "../components/StateViews";
import { colors } from "../theme/colors";
import { typography } from "../theme/spacing";
import { useAuthStore } from "../store/authStore";

export default function SplashScreen() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo Productivity</Text>
      <LoadingState label="Starting up\u2026" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  title: { ...typography.h1, color: colors.text },
});
