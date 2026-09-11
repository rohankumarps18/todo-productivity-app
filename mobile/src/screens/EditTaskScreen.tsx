import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import TaskForm from "../components/TaskForm";
import { ErrorState, LoadingState } from "../components/StateViews";
import { useTask } from "../hooks/useTask";
import { colors } from "../theme/colors";
import { spacing, typography } from "../theme/spacing";
import { useTaskStore } from "../store/taskStore";
import type { AppStackParamList } from "../navigation/types";
import type { CreateTaskInput } from "../types/api";

type Props = NativeStackScreenProps<AppStackParamList, "EditTask">;

export default function EditTaskScreen({ route, navigation }: Props) {
  const { taskId } = route.params;
  const { task, status, error, refetch } = useTask(taskId);
  const updateTask = useTaskStore((s) => s.updateTask);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (status === "loading" && !task) {
    return <LoadingState label="Loading task\u2026" />;
  }

  if (status === "error" && !task) {
    return <ErrorState message={error ?? "Failed to load task."} onRetry={refetch} />;
  }

  if (!task) {
    return <ErrorState message="Task not found." />;
  }

  const handleSubmit = async (input: CreateTaskInput) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateTask(task._id, input);
      navigation.goBack();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Couldn't save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit task</Text>
      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
      <TaskForm initialTask={task} submitLabel="Save changes" submitting={submitting} onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h2, color: colors.text, padding: spacing.lg, paddingBottom: 0 },
  error: { color: colors.danger, paddingHorizontal: spacing.lg, marginTop: spacing.sm, fontSize: 13 },
});
