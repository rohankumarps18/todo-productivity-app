import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { EmptyState, ErrorState, LoadingState } from "../components/StateViews";
import { fetchInsights } from "../services/taskService";
import { colors } from "../theme/colors";
import { spacing, typography } from "../theme/spacing";
import type { Insights } from "../types/api";

function formatDuration(ms: number): string {
  const hours = ms / (60 * 60 * 1000);
  if (hours < 1) return `${Math.round(ms / 60000)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export default function InsightsScreen() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchInsights();
      setInsights(data);
      setStatus("success");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (status === "loading") {
    return <LoadingState label="Crunching your numbers\u2026" />;
  }

  if (status === "error" || !insights) {
    return <ErrorState message={error ?? "Failed to load insights."} onRetry={load} />;
  }

  if (insights.total === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        subtitle="Insights will show up here once you've added and worked through a few tasks."
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.grid}>
        <StatCard label="Total tasks" value={String(insights.total)} />
        <StatCard label="Completed" value={String(insights.completed)} accent={colors.success} />
        <StatCard label="Pending" value={String(insights.pending)} />
        <StatCard label="Overdue" value={String(insights.overdue)} accent={insights.overdue > 0 ? colors.danger : undefined} />
        <StatCard label="Completion rate" value={`${insights.completionRate}%`} accent={colors.primary} />
        <StatCard label="High priority done" value={String(insights.highPriorityCompleted)} />
        <StatCard label="Completed today" value={String(insights.completedToday)} />
        <StatCard label="Created today" value={String(insights.createdToday)} />
      </View>

      <View style={styles.avgCard}>
        <Text style={styles.avgLabel}>Average time to complete a task</Text>
        <Text style={styles.avgValue}>
          {insights.hasEnoughDataForAverage && insights.averageCompletionTimeMs !== null
            ? formatDuration(insights.averageCompletionTimeMs)
            : "Not enough data yet"}
        </Text>
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.cardValue, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl, backgroundColor: colors.background },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  card: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardValue: { ...typography.h1, color: colors.text, fontSize: 24 },
  cardLabel: { color: colors.textDim, fontSize: 12, marginTop: spacing.xs },
  avgCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  avgLabel: { color: colors.textDim, fontSize: 13 },
  avgValue: { ...typography.h2, color: colors.text, marginTop: spacing.xs },
});
