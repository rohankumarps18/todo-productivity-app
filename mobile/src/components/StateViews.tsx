import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing, typography } from "../theme/spacing";

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function LoadingState({ label = "Loading\u2026" }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} size="small" />
      <Text style={[styles.subtitle, { marginTop: spacing.sm }]}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.subtitle}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  title: { ...typography.h3, color: colors.text, textAlign: "center" },
  subtitle: {
    ...typography.body,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  errorTitle: { ...typography.h3, color: colors.danger, textAlign: "center" },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryText: { color: colors.text, fontWeight: "600" },
});
