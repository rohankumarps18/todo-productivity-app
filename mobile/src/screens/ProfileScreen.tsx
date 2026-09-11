import { StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { spacing, typography } from "../theme/spacing";
import { useAuthStore } from "../store/authStore";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name ?? "?").charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? "\u2014"}</Text>
        <Text style={styles.email}>{user?.email ?? "\u2014"}</Text>
      </View>

      <PrimaryButton label="Log out" variant="danger" onPress={logout} style={styles.logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xxl,
    marginTop: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "700" },
  name: { ...typography.h3, color: colors.text },
  email: { color: colors.textDim, fontSize: 13, marginTop: spacing.xs },
  logout: { marginTop: spacing.xl },
});
