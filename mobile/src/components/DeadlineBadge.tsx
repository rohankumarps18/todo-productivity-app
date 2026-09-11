import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { formatDateTime, formatTimeRemaining } from "../utils/dateFormat";

export default function DeadlineBadge({ deadline }: { deadline: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.date}>{formatDateTime(deadline)}</Text>
      <Text style={styles.remaining}>{formatTimeRemaining(deadline)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 1 },
  date: { color: colors.textDim, fontSize: 12 },
  remaining: { color: colors.textFaint, fontSize: 11 },
});
