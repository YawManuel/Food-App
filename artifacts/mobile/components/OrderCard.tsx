import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Order, OrderStatus } from "@/context/OrderContext";

type Props = {
  order: Order;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  on_the_way: "On the Way",
  delivered: "Delivered",
};

const STATUS_STEPS: OrderStatus[] = [
  "placed",
  "confirmed",
  "preparing",
  "on_the_way",
  "delivered",
];

export function OrderCard({ order }: Props) {
  const colors = useColors();
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isDelivered = order.status === "delivered";

  const statusColor = isDelivered ? colors.success : colors.secondary;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.orderId, { color: colors.mutedForeground }]}>
            Order #{order.id.slice(-6).toUpperCase()}
          </Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {new Date(order.placedAt).toLocaleDateString("en-GH", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_LABELS[order.status]}
          </Text>
        </View>
      </View>

      {!isDelivered && (
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
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.items}>
        {order.items.slice(0, 3).map((ci) => (
          <Text
            key={ci.item.id}
            style={[styles.itemLine, { color: colors.foreground }]}
          >
            {ci.quantity}× {ci.item.name}
          </Text>
        ))}
        {order.items.length > 3 && (
          <Text style={[styles.itemLine, { color: colors.mutedForeground }]}>
            +{order.items.length - 3} more
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.addressRow}>
          <MaterialIcons name="location-on" size={14} color={colors.mutedForeground} />
          <Text
            style={[styles.address, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {order.address}
          </Text>
        </View>
        <Text style={[styles.total, { color: colors.primary }]}>
          GH₵ {order.totalPrice}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  tracker: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    flex: 1,
    height: 2,
  },
  divider: {
    height: 1,
    marginBottom: 10,
  },
  items: {
    gap: 3,
    marginBottom: 10,
  },
  itemLine: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  address: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  total: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
