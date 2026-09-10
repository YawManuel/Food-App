import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import {
  STATUS_LABELS,
  STATUS_STEPS,
  type Order,
} from "@/context/OrderContext";
import { formatCedis, formatEta, formatOrderDate } from "@/utils/format";

type Props = {
  order: Order;
  onPress?: () => void;
};

export function OrderCard({ order, onPress }: Props) {
  const colors = useColors();

  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";
  const isFinished = isDelivered || isCancelled;

  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const statusColor = isCancelled
    ? colors.destructive
    : isDelivered
      ? colors.success
      : colors.secondary;

  const totalUnits = order.items.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`Order ${order.code}, ${STATUS_LABELS[order.status]}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && onPress && { opacity: 0.9, transform: [{ scale: 0.995 }] },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.orderId, { color: colors.foreground }]}>
            {order.code}
          </Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {formatOrderDate(order.placedAt)}
          </Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_LABELS[order.status]}
          </Text>
        </View>
      </View>

      {/* Progress rail — pointless once the order has reached a terminal state */}
      {!isFinished && (
        <>
          <View style={styles.tracker}>
            {STATUS_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i <= stepIndex ? colors.primary : colors.border,
                    },
                  ]}
                />
                {i < STATUS_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      {
                        backgroundColor:
                          i < stepIndex ? colors.primary : colors.border,
                      },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
          <Text style={[styles.eta, { color: colors.primary }]}>
            {formatEta(order.minutesRemaining)}
          </Text>
        </>
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.items}>
        {order.items.slice(0, 3).map((line) => (
          <Text
            key={line.item.id}
            style={[styles.itemLine, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {line.quantity}× {line.item.name}
          </Text>
        ))}
        {order.items.length > 3 && (
          <Text style={[styles.more, { color: colors.mutedForeground }]}>
            +{order.items.length - 3} more
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {totalUnits} {totalUnits === 1 ? "item" : "items"}
        </Text>
        <View style={styles.footerRight}>
          <Text style={[styles.total, { color: colors.foreground }]}>
            {formatCedis(order.total)}
          </Text>
          {onPress && (
            <Feather
              name="chevron-right"
              size={17}
              color={colors.mutedForeground}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  orderId: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11.5,
    fontFamily: "Inter_600SemiBold",
  },
  tracker: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  line: {
    flex: 1,
    height: 2,
  },
  eta: {
    fontSize: 12.5,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  items: {
    gap: 4,
  },
  itemLine: {
    fontSize: 13.5,
    fontFamily: "Inter_500Medium",
  },
  more: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  count: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
  },
  total: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
