import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "danger" | "secondary";
  style?: StyleProp<ViewStyle>;
}

export default function PrimaryButton({ label, onPress, loading, disabled, variant = "primary", style }: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.base, VARIANT_STYLES[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? colors.text : "#fff"} size="small" />
      ) : (
        <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const VARIANT_STYLES = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  secondary: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
});

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  disabled: { opacity: 0.5 },
  label: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryLabel: { color: colors.text },
});
