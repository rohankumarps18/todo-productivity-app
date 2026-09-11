import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import type { UrgencyLabel } from "../types/api";

const RISK_COLOR: Record<UrgencyLabel, string> = {
  OVERDUE: colors.riskOverdue,
  CRITICAL: colors.riskCritical,
  "DUE SOON": colors.riskDueSoon,
  "ON TRACK": colors.riskOnTrack,
  "LOW URGENCY": colors.riskLowUrgency,
};

interface Props {
  label: UrgencyLabel;
  compact?: boolean;
}

/** Shows the urgency label the backend's calculateTaskUrgency() computed -
 * this component never derives its own urgency, it only renders the one
 * source of truth. */
export default function RiskBadge({ label, compact }: Props) {
  const color = RISK_COLOR[label];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }, compact && styles.compact]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  compact: { paddingHorizontal: spacing.xs, paddingVertical: 2 },
  text: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
});
