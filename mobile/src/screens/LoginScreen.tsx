import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { spacing, typography } from "../theme/spacing";
import { useAuthStore } from "../store/authStore";
import type { AuthStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

interface FormValues {
  email: string;
  password: string;
}

export default function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((s) => s.login);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await login({ email: values.email.trim(), password: values.password });
      // Navigation to the App stack happens automatically in RootNavigator
      // once useAuthStore.token becomes non-null.
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to see your tasks.</Text>

        <Controller
          control={control}
          name="email"
          rules={{ required: "Email is required." }}
          render={({ field }) => (
            <InputField
              label="Email"
              value={field.value}
              onChangeText={field.onChange}
              autoCapitalize="none"
              keyboardType="email-address"
              error={formState.errors.email?.message}
              placeholder="you@example.com"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: "Password is required." }}
          render={({ field }) => (
            <InputField
              label="Password"
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              error={formState.errors.password?.message}
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
            />
          )}
        />

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <PrimaryButton label="Log in" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

        <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.footerText}>
            Don't have an account? <Text style={styles.footerLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: "center", padding: spacing.xl },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textDim, marginBottom: spacing.xl },
  submitError: { color: colors.danger, marginBottom: spacing.md, fontSize: 13 },
  footer: { marginTop: spacing.xl, alignItems: "center" },
  footerText: { color: colors.textDim, fontSize: 13 },
  footerLink: { color: colors.primary, fontWeight: "700" },
});
