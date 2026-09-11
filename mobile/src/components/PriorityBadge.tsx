import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import type { TaskPriority } from "../types/api";

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  HIGH: colors.priorityHigh,
  MEDIUM: colors.priorityMedium,
  LOW: colors.priorityLow,
};

export default function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const color = PRIORITY_COLOR[priority];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{priority}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
});
