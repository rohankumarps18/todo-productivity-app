import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import TaskForm from "../components/TaskForm";
import { colors } from "../theme/colors";
import { spacing, typography } from "../theme/spacing";
import { useTaskStore } from "../store/taskStore";
import type { AppStackParamList } from "../navigation/types";
import type { CreateTaskInput } from "../types/api";

type Props = NativeStackScreenProps<AppStackParamList, "AddTask">;

export default function AddTaskScreen({ navigation }: Props) {
  const createTask = useTaskStore((s) => s.createTask);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: CreateTaskInput) => {
    setSubmitting(true);
    setError(null);
    try {
      await createTask(input);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New task</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TaskForm submitLabel="Create task" submitting={submitting} onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h2, color: colors.text, padding: spacing.lg, paddingBottom: 0 },
  error: { color: colors.danger, paddingHorizontal: spacing.lg, marginTop: spacing.sm, fontSize: 13 },
});
