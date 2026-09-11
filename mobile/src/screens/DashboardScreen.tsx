import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import TaskCard from "../components/TaskCard";
import ConfirmationModal from "../components/ConfirmationModal";
import { EmptyState, ErrorState, LoadingState } from "../components/StateViews";
import { colors } from "../theme/colors";
import { spacing, typography } from "../theme/spacing";
import { useAuthStore } from "../store/authStore";
import { useTaskStore } from "../store/taskStore";
import type { AppStackParamList } from "../navigation/types";
import type { Task, TaskSortMode } from "../types/api";

type Props = NativeStackScreenProps<AppStackParamList, "Dashboard">;

const SORT_OPTIONS: { mode: TaskSortMode; label: string }[] = [
  { mode: "smart", label: "Smart" },
  { mode: "deadline", label: "Deadline" },
  { mode: "priority", label: "Priority" },
  { mode: "newest", label: "Newest" },
  { mode: "completed", label: "Completed" },
];

export default function DashboardScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  // Edge-to-edge is enabled (gradle.properties: edgeToEdgeEnabled=true), so the
  // app draws behind the status bar. We must offset our custom header by the real
  // top inset so its interactive elements are never hidden under the system bar.
  const { top: topInset } = useSafeAreaInsets();

  const { tasks, status, error, sortMode, loadTasks, setSortMode, completeTask, deleteTask } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks(sortMode);
    setRefreshing(false);
  }, [loadTasks, sortMode]);

  const handleComplete = (task: Task) => {
    completeTask(task._id).catch(() => {
      // Store already rolled back and set `error`; nothing extra to do
      // here besides not crashing the tap handler.
    });
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await deleteTask(pendingDeleteId);
    } catch {
      // Store rolled back and surfaced `error` already.
    } finally {
      setDeleting(false);
      setPendingDeleteId(null);
    }
  };

  const greeting = user ? `Hi, ${user.name.split(" ")[0]}` : "Hi";
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={styles.container}>
      {/*
       * paddingTop = safe-area topInset + design spacing.
       * Without topInset the header renders behind the status bar on edge-to-edge
       * Android builds (edgeToEdgeEnabled=true), and the OS intercepts all touches
       * in the status-bar region, making these buttons silently unresponsive.
       */}
      <View style={[styles.header, { paddingTop: topInset + spacing.lg }]}>
        {/* flexShrink:1 prevents the greeting from growing into the buttons area */}
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.date}>{todayLabel}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => {
              console.log("FOCUS_BUTTON_PRESSED");
              navigation.navigate("FocusMode");
            }}
          >
            <Text style={styles.headerAction}>Focus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => {
              console.log("INSIGHTS_BUTTON_PRESSED");
              navigation.navigate("Insights");
            }}
          >
            <Text style={styles.headerAction}>Insights</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => {
              console.log("PROFILE_BUTTON_PRESSED");
              navigation.navigate("Profile");
            }}
          >
            <Text style={styles.headerAction}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={SORT_OPTIONS}
        keyExtractor={(item) => item.mode}
        contentContainerStyle={styles.sortRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.sortChip, sortMode === item.mode && styles.sortChipActive]}
            onPress={() => setSortMode(item.mode)}
          >
            <Text style={[styles.sortChipText, sortMode === item.mode && styles.sortChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {status === "loading" && tasks.length === 0 ? (
        <LoadingState label="Loading your tasks…" />
      ) : status === "error" && tasks.length === 0 ? (
        <ErrorState message={error ?? "Failed to load tasks."} onRetry={() => loadTasks(sortMode)} />
      ) : tasks.length === 0 ? (
        <EmptyState
          title={sortMode === "completed" ? "No completed tasks yet" : "You're all clear"}
          subtitle={
            sortMode === "completed"
              ? "Tasks you finish will show up here."
              : "Tap the + button to add your first task."
          }
        />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => navigation.navigate("TaskDetails", { taskId: item._id })}
              onComplete={() => handleComplete(item)}
              onDelete={() => setPendingDeleteId(item._id)}
            />
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddTask")}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <ConfirmationModal
        visible={pendingDeleteId !== null}
        title="Delete task?"
        message="This can't be undone."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    // paddingTop is set inline as (topInset + spacing.lg) to clear the status bar
    // on edge-to-edge Android builds. Do not add a static paddingTop here.
  },
  // flexShrink:1 ensures a long greeting name never overflows into the buttons area.
  headerLeft: { flexShrink: 1 },
  greeting: { ...typography.h1, color: colors.text },
  date: { ...typography.body, color: colors.textDim, marginTop: 2 },
  logout: { color: colors.textDim, fontSize: 13, marginTop: spacing.xs },
  headerActions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xs },
  // paddingVertical gives each button a reliable ≥37dp tap target (8+~17+8).
  // paddingHorizontal extends the tappable area slightly beyond the text edges.
  headerActionBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.xs },
  headerAction: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  sortRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  sortChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  sortChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sortChipText: { color: colors.textDim, fontSize: 12, fontWeight: "600" },
  sortChipTextActive: { color: "#fff" },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabIcon: { color: "#fff", fontSize: 28, fontWeight: "300", marginTop: -2 },
});
