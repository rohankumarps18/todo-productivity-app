import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import ConfirmationModal from "../components/ConfirmationModal";
import PriorityBadge from "../components/PriorityBadge";
import PrimaryButton from "../components/PrimaryButton";
import RiskBadge from "../components/RiskBadge";
import { ErrorState, LoadingState } from "../components/StateViews";
import { useTask } from "../hooks/useTask";
import { colors } from "../theme/colors";
import { spacing, typography } from "../theme/spacing";
import { useTaskStore } from "../store/taskStore";
import { formatDateTime, formatTimeRemaining } from "../utils/dateFormat";
import type { AppStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AppStackParamList, "TaskDetails">;

export default function TaskDetailsScreen({ route, navigation }: Props) {
  const { taskId } = route.params;
  const { task, status, error, refetch } = useTask(taskId);
  const completeTask = useTaskStore((s) => s.completeTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const [actionError, setActionError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (status === "loading" && !task) {
    return <LoadingState label="Loading task\u2026" />;
  }

  if (status === "error" && !task) {
    return <ErrorState message={error ?? "Failed to load task."} onRetry={refetch} />;
  }

  if (!task) {
    return <ErrorState message="Task not found." />;
  }

  const isCompleted = task.status === "COMPLETED";

  const handleComplete = async () => {
    setActionError(null);
    setCompleting(true);
    try {
      await completeTask(task._id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't mark the task complete.");
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(task._id);
      navigation.goBack();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't delete the task.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, isCompleted && styles.titleCompleted]}>{task.title}</Text>
        <PriorityBadge priority={task.priority} />
      </View>

      {!isCompleted && (
        <View style={styles.riskRow}>
          <RiskBadge label={task.urgency.label} />
          <Text style={styles.reason}>{task.urgency.reason}</Text>
        </View>
      )}

      {task.description ? <Text style={styles.description}>{task.description}</Text> : null}

      <View style={styles.metaCard}>
        <MetaRow label="Starts" value={formatDateTime(task.dateTime)} />
        <MetaRow label="Deadline" value={formatDateTime(task.deadline)} />
        {!isCompleted && <MetaRow label="Time remaining" value={formatTimeRemaining(task.deadline)} />}
        <MetaRow label="Status" value={task.status} />
        {task.completedAt && <MetaRow label="Completed" value={formatDateTime(task.completedAt)} />}
      </View>

      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

      <View style={styles.actions}>
        {!isCompleted && (
          <PrimaryButton label="Mark complete" onPress={handleComplete} loading={completing} />
        )}
        <PrimaryButton
          label="Edit task"
          variant="secondary"
          onPress={() => navigation.navigate("EditTask", { taskId: task._id })}
        />
        <PrimaryButton label="Delete task" variant="danger" onPress={() => setConfirmingDelete(true)} />
      </View>

      <ConfirmationModal
        visible={confirmingDelete}
        title="Delete task?"
        message="This can't be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </ScrollView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl, backgroundColor: colors.background },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  title: { ...typography.h2, color: colors.text, flexShrink: 1 },
  titleCompleted: { textDecorationLine: "line-through", color: colors.textFaint },
  riskRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.md },
  reason: { color: colors.textDim, fontSize: 12, flexShrink: 1 },
  description: { color: colors.textDim, fontSize: 14, marginTop: spacing.lg, lineHeight: 20 },
  metaCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  metaLabel: { color: colors.textFaint, fontSize: 13 },
  metaValue: { color: colors.text, fontSize: 13, fontWeight: "600" },
  error: { color: colors.danger, marginTop: spacing.md, fontSize: 13 },
  actions: { marginTop: spacing.xl, gap: spacing.md },
});
