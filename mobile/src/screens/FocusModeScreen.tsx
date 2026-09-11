import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import PriorityBadge from "../components/PriorityBadge";
import RiskBadge from "../components/RiskBadge";
import { EmptyState, ErrorState, LoadingState } from "../components/StateViews";
import { colors } from "../theme/colors";
import { spacing, typography } from "../theme/spacing";
import { useTaskStore } from "../store/taskStore";
import { formatDateTime, formatTimeRemaining } from "../utils/dateFormat";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AppStackParamList, "FocusMode">;

/**
 * Ranks active tasks purely by the urgency score the backend already
 * computed (calculateTaskUrgency) - this screen doesn't recalculate or
 * second-guess it, just orders by it. Deadline is the tiebreaker for equal
 * scores so the ordering is stable and explainable.
 */
function rankActiveTasks(tasks: ReturnType<typeof useTaskStore.getState>["tasks"]) {
  return tasks
    .filter((t) => t.status !== "COMPLETED")
    .sort((a, b) => {
      if (b.urgency.score !== a.urgency.score) return b.urgency.score - a.urgency.score;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
}

export default function FocusModeScreen({ navigation }: Props) {
  const { tasks, status, error, loadTasks, completeTask } = useTaskStore();
  const [skipIndex, setSkipIndex] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    // Always refetch with the default "smart" sort on entry. The shared
    // store may currently hold whatever filtered list the Dashboard last
    // requested (e.g. sortMode "completed" only returns completed tasks) -
    // reusing that here would silently hide active tasks from Focus Mode.
    loadTasks("smart");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ranked = useMemo(() => rankActiveTasks(tasks), [tasks]);

  // Keep the "skip" pointer in range as the underlying list changes size
  // (e.g. after completing a task removes it from the ranked list).
  const activeIndex = ranked.length === 0 ? 0 : skipIndex % ranked.length;
  const current = ranked[activeIndex] ?? null;

  if (status === "loading" && tasks.length === 0) {
    return <LoadingState label="Finding your next task\u2026" />;
  }

  if (status === "error" && tasks.length === 0) {
    return <ErrorState message={error ?? "Failed to load tasks."} onRetry={() => loadTasks()} />;
  }

  if (!current) {
    return <EmptyState title="All caught up" subtitle="No active tasks need your focus right now." />;
  }

  const handleComplete = async () => {
    setActionError(null);
    setCompleting(true);
    try {
      await completeTask(current._id);
      // Completing removes it from `ranked` next render; keep the same
      // pointer so the next-highest task slides into view automatically.
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't mark the task complete.");
    } finally {
      setCompleting(false);
    }
  };

  const handleSkip = () => {
    if (ranked.length <= 1) return;
    setSkipIndex((i) => (i + 1) % ranked.length);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Recommended next</Text>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{current.title}</Text>
          <PriorityBadge priority={current.priority} />
        </View>

        {current.description ? <Text style={styles.description}>{current.description}</Text> : null}

        <View style={styles.riskRow}>
          <RiskBadge label={current.urgency.label} />
          <Text style={styles.timeRemaining}>{formatTimeRemaining(current.deadline)}</Text>
        </View>

        <Text style={styles.deadline}>Due {formatDateTime(current.deadline)}</Text>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Why this task</Text>
          <Text style={styles.reasonText}>{current.urgency.reason}</Text>
        </View>
      </View>

      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

      <View style={styles.actions}>
        <PrimaryButton label="Mark complete" onPress={handleComplete} loading={completing} />
        <PrimaryButton
          label="Edit"
          variant="secondary"
          onPress={() => navigation.navigate("EditTask", { taskId: current._id })}
        />
        {ranked.length > 1 && <PrimaryButton label="Skip for now" variant="secondary" onPress={handleSkip} />}
      </View>

      {ranked.length > 1 && (
        <Text style={styles.queueHint}>
          {ranked.length - 1} more active task{ranked.length - 1 === 1 ? "" : "s"} waiting
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  eyebrow: { color: colors.textFaint, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  title: { ...typography.h2, color: colors.text, flexShrink: 1 },
  description: { color: colors.textDim, fontSize: 14, marginTop: spacing.sm, lineHeight: 20 },
  riskRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.md },
  timeRemaining: { color: colors.textDim, fontSize: 12 },
  deadline: { color: colors.textFaint, fontSize: 12, marginTop: spacing.xs },
  reasonBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 10,
    padding: spacing.md,
  },
  reasonLabel: { color: colors.textFaint, fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  reasonText: { color: colors.text, fontSize: 13, marginTop: spacing.xs },
  error: { color: colors.danger, marginTop: spacing.md, fontSize: 13 },
  actions: { marginTop: spacing.xl, gap: spacing.md },
  queueHint: { color: colors.textFaint, fontSize: 12, textAlign: "center", marginTop: spacing.lg },
});