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

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen({ navigation }: Props) {
  const register = useAuthStore((s) => s.register);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState, watch } = useForm<FormValues>({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start organizing what matters.</Text>

        <Controller
          control={control}
          name="name"
          rules={{ required: "Name is required." }}
          render={({ field }) => (
            <InputField
              label="Name"
              value={field.value}
              onChangeText={field.onChange}
              error={formState.errors.name?.message}
              placeholder="Ada Lovelace"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required.",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email." },
          }}
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
          rules={{
            required: "Password is required.",
            minLength: { value: 8, message: "Must be at least 8 characters." },
          }}
          render={({ field }) => (
            <InputField
              label="Password"
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              error={formState.errors.password?.message}
              placeholder="At least 8 characters"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: "Please confirm your password.",
            validate: (value) => value === watch("password") || "Passwords do not match.",
          }}
          render={({ field }) => (
            <InputField
              label="Confirm password"
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              error={formState.errors.confirmPassword?.message}
              placeholder="Repeat your password"
            />
          )}
        />

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <PrimaryButton label="Create account" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

        <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.footerLink}>Log in</Text>
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
