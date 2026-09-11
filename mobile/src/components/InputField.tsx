import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export default function InputField({ label, error, style, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.textFaint}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { color: colors.textDim, fontSize: 12, fontWeight: "600", marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 15,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
});
