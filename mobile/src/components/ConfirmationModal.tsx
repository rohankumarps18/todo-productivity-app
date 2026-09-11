import { Modal, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import PrimaryButton from "./PrimaryButton";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel = "Delete",
  loading,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <PrimaryButton label="Cancel" onPress={onCancel} variant="secondary" style={styles.actionButton} />
            <PrimaryButton
              label={confirmLabel}
              onPress={onConfirm}
              variant="danger"
              loading={loading}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: spacing.sm },
  message: { color: colors.textDim, fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  actionButton: { flex: 1 },
});
