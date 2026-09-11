import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import type { Task } from "../types/api";
import DeadlineBadge from "./DeadlineBadge";
import PriorityBadge from "./PriorityBadge";
import RiskBadge from "./RiskBadge";

interface Props {
  task: Task;
  onPress: () => void;
  onComplete: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, onPress, onComplete, onDelete }: Props) {
  const isCompleted = task.status === "COMPLETED";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, isCompleted && styles.titleCompleted]} numberOfLines={1}>
          {task.title}
        </Text>
        <PriorityBadge priority={task.priority} />
      </View>

      {task.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      <View style={styles.metaRow}>
        <DeadlineBadge deadline={task.deadline} />
        {!isCompleted && <RiskBadge label={task.urgency.label} compact />}
      </View>

      <View style={styles.actionsRow}>
        {!isCompleted && (
          <TouchableOpacity style={styles.actionButton} onPress={onComplete}>
            <Text style={styles.completeText}>Mark complete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  title: { color: colors.text, fontSize: 15, fontWeight: "600", flexShrink: 1 },
  titleCompleted: { textDecorationLine: "line-through", color: colors.textFaint },
  description: { color: colors.textDim, fontSize: 13, marginTop: spacing.xs },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionButton: { paddingVertical: spacing.xs },
  completeText: { color: colors.success, fontSize: 13, fontWeight: "600" },
  deleteText: { color: colors.danger, fontSize: 13, fontWeight: "600" },
});
