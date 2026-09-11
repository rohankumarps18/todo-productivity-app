import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import InputField from "./InputField";
import PrimaryButton from "./PrimaryButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { CreateTaskInput, Task, TaskPriority } from "../types/api";

export interface TaskFormValues {
  title: string;
  description: string;
  dateTime: Date;
  deadline: Date;
  priority: TaskPriority;
}

interface Props {
  initialTask?: Task;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (input: CreateTaskInput) => void;
}

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

function defaultValuesFor(task?: Task): TaskFormValues {
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    dateTime: task ? new Date(task.dateTime) : now,
    deadline: task ? new Date(task.deadline) : inOneHour,
    priority: task?.priority ?? "MEDIUM",
  };
}

type PickerTarget = "dateTime" | "deadline" | null;

export default function TaskForm({ initialTask, submitLabel, submitting, onSubmit }: Props) {
  const { control, handleSubmit, formState, watch, setValue } = useForm<TaskFormValues>({
    defaultValues: defaultValuesFor(initialTask),
  });
  // activePicker is only used on iOS (inline DateTimePicker).
  // On Android we drive the picker imperatively to avoid mode="datetime" which is iOS-only.
  const [activePicker, setActivePicker] = useState<PickerTarget>(null);
  const [deadlineError, setDeadlineError] = useState<string | null>(null);

  const dateTime = watch("dateTime");
  const deadline = watch("deadline");

  /**
   * Android-only: opens a two-step date→time dialog via the imperative API.
   * mode="datetime" is not in ANDROID_MODE and causes pickers[mode].dismiss()
   * to throw on component unmount. Using the imperative API avoids mounting
   * the JSX component entirely on Android.
   */
  const openAndroidPicker = (target: NonNullable<PickerTarget>) => {
    const currentValue = target === "dateTime" ? dateTime : deadline;
    // Step 1: Date
    DateTimePickerAndroid.open({
      value: currentValue,
      mode: "date",
      onChange: (_evt, selectedDate) => {
        if (!selectedDate) return; // user dismissed the date dialog
        // Step 2: Time – carry forward the date chosen in step 1
        DateTimePickerAndroid.open({
          value: selectedDate,
          mode: "time",
          is24Hour: true,
          onChange: (_e, selectedTime) => {
            if (!selectedTime) return; // user dismissed the time dialog
            setValue(target, selectedTime, { shouldValidate: true });
          },
        });
      },
    });
  };

  const submit = (values: TaskFormValues) => {
    if (values.deadline.getTime() < values.dateTime.getTime()) {
      setDeadlineError("Deadline can't be before the start date/time.");
      return;
    }
    setDeadlineError(null);
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      dateTime: values.dateTime.toISOString(),
      deadline: values.deadline.toISOString(),
      priority: values.priority,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="title"
        rules={{ required: "Title is required.", maxLength: { value: 200, message: "Too long." } }}
        render={({ field }) => (
          <InputField
            label="Title"
            value={field.value}
            onChangeText={field.onChange}
            error={formState.errors.title?.message}
            placeholder="What needs doing?"
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <InputField
            label="Description (optional)"
            value={field.value}
            onChangeText={field.onChange}
            multiline
            numberOfLines={3}
            style={styles.multiline}
            placeholder="Any extra detail\u2026"
          />
        )}
      />

      <Text style={styles.label}>Start date/time</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() =>
          Platform.OS === "android" ? openAndroidPicker("dateTime") : setActivePicker("dateTime")
        }
      >
        <Text style={styles.dateButtonText}>{dateTime.toLocaleString()}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Deadline</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() =>
          Platform.OS === "android" ? openAndroidPicker("deadline") : setActivePicker("deadline")
        }
      >
        <Text style={styles.dateButtonText}>{deadline.toLocaleString()}</Text>
      </TouchableOpacity>
      {deadlineError ? <Text style={styles.error}>{deadlineError}</Text> : null}

      {/* On iOS only: render an inline spinner. Android uses the imperative API above. */}
      {Platform.OS === "ios" && activePicker && (
        <DateTimePicker
          value={activePicker === "dateTime" ? dateTime : deadline}
          mode="datetime"
          display="spinner"
          onChange={(_event, selected) => {
            if (selected) setValue(activePicker, selected, { shouldValidate: true });
          }}
        />
      )}

      <Text style={styles.label}>Priority</Text>
      <Controller
        control={control}
        name="priority"
        render={({ field }) => (
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.priorityChip, field.value === p && styles.priorityChipActive]}
                onPress={() => field.onChange(p)}
              >
                <Text style={[styles.priorityChipText, field.value === p && styles.priorityChipTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      <PrimaryButton
        label={submitLabel}
        onPress={handleSubmit(submit)}
        loading={submitting}
        style={styles.submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: { color: colors.textDim, fontSize: 12, fontWeight: "600", marginBottom: spacing.xs },
  multiline: { minHeight: 72, textAlignVertical: "top" },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  dateButtonText: { color: colors.text, fontSize: 14 },
  error: { color: colors.danger, fontSize: 12, marginTop: -spacing.md, marginBottom: spacing.md },
  priorityRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  priorityChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  priorityChipText: { color: colors.textDim, fontWeight: "700", fontSize: 12 },
  priorityChipTextActive: { color: "#fff" },
  submit: { marginTop: spacing.sm },
});
