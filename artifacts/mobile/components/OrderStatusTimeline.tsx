import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import {
  STATUS_LABELS,
  STATUS_STEPS,
  type OrderStatus,
} from "@/context/OrderContext";

type Props = {
  status: OrderStatus;
};

const STEP_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  placed: "file-text",
  confirmed: "check-circle",
  preparing: "coffee",
  on_the_way: "truck",
  delivered: "home",
};

const STEP_BLURBS: Record<string, string> = {
  placed: "We've received your order",
  confirmed: "The kitchen accepted your order",
  preparing: "Your food is being cooked fresh",
  on_the_way: "Your rider is heading to you",
  delivered: "Enjoy your meal!",
};

/**
 * Vertical progress rail for the tracking screen. A cancelled order short
 * circuits to a single terminal row — walking a progress bar for something
 * that was called off reads as broken.
 */
export function OrderStatusTimeline({ status }: Props) {
  const colors = useColors();

  if (status === "cancelled") {
    return (
      <View
        style={[
          styles.cancelled,
          { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "40" },
        ]}
      >
        <Feather name="x-circle" size={20} color={colors.destructive} />
        <View style={styles.cancelledText}>
          <Text style={[styles.cancelledTitle, { color: colors.destructive }]}>
            Order cancelled
          </Text>
          <Text style={[styles.cancelledBlurb, { color: colors.mutedForeground }]}>
            Nothing was charged. You can reorder any time.
          </Text>
        </View>
      </View>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <View style={styles.timeline}>
      {STATUS_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isReached = isDone || isCurrent;
        const isLast = index === STATUS_STEPS.length - 1;

        const dotColor = isReached ? colors.primary : colors.border;
        const labelColor = isReached ? colors.foreground : colors.mutedForeground;

        return (
          <View key={step} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: dotColor, borderColor: dotColor },
                  isCurrent && styles.dotCurrent,
                  isCurrent && { borderColor: colors.primary + "45" },
                ]}
              >
                <Feather
                  name={isDone ? "check" : STEP_ICONS[step]}
                  size={13}
                  color={isReached ? colors.primaryForeground : colors.mutedForeground}
                />
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: isDone ? colors.primary : colors.border },
                  ]}
                />
              )}
            </View>

            <View style={[styles.content, isLast && styles.contentLast]}>
              <Text style={[styles.label, { color: labelColor }]}>
                {STATUS_LABELS[step]}
              </Text>
              <Text style={[styles.blurb, { color: colors.mutedForeground }]}>
                {STEP_BLURBS[step]}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  rail: {
    alignItems: "center",
    width: 30,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dotCurrent: {
    borderWidth: 4,
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 26,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    paddingBottom: 22,
  },
  contentLast: {
    paddingBottom: 0,
  },
  label: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
  },
  blurb: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  cancelled: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  cancelledText: {
    flex: 1,
  },
  cancelledTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  cancelledBlurb: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
});
