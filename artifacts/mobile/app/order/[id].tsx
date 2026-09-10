import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OrderStatusTimeline } from "@/components/OrderStatusTimeline";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useColors } from "@/hooks/useColors";
import { IMAGE_MAP } from "@/constants/menu";
import { useCart } from "@/context/CartContext";
import {
  PAYMENT_LABELS,
  STATUS_LABELS,
  useOrders,
} from "@/context/OrderContext";
import { formatCedis, formatEta, formatOrderDate } from "@/utils/format";

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getOrder, cancelOrder, canCancel, hydrated } = useOrders();
  const { addItem } = useCart();

  const order = getOrder(id);
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!order) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Order" />
        <View style={styles.center}>
          {hydrated ? (
            <>
              <Feather
                name="alert-circle"
                size={40}
                color={colors.mutedForeground}
              />
              <Text style={[styles.missing, { color: colors.mutedForeground }]}>
                We couldn&apos;t find that order.
              </Text>
            </>
          ) : null}
        </View>
      </View>
    );
  }

  const isFinished = order.status === "delivered" || order.status === "cancelled";

  const handleCancel = () => {
    const confirm = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      cancelOrder(order.id);
    };

    // Alert.alert has no buttons on web — fall back to an immediate cancel
    // there rather than leaving the button dead.
    if (Platform.OS === "web") {
      confirm();
      return;
    }

    Alert.alert(
      "Cancel this order?",
      "The kitchen hasn't started cooking yet, so you won't be charged.",
      [
        { text: "Keep order", style: "cancel" },
        { text: "Cancel order", style: "destructive", onPress: confirm },
      ],
    );
  };

  const handleReorder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    for (const line of order.items) {
      addItem(line.item, line.quantity);
    }
    router.push("/(tabs)/cart");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={order.code}
        subtitle={formatOrderDate(order.placedAt)}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ETA hero */}
        <View
          style={[
            styles.hero,
            {
              backgroundColor:
                order.status === "cancelled"
                  ? colors.muted
                  : colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.heroLabel,
              {
                color:
                  order.status === "cancelled"
                    ? colors.mutedForeground
                    : colors.primaryForeground + "CC",
              },
            ]}
          >
            {isFinished ? "STATUS" : "ESTIMATED ARRIVAL"}
          </Text>
          <Text
            style={[
              styles.heroValue,
              {
                color:
                  order.status === "cancelled"
                    ? colors.foreground
                    : colors.primaryForeground,
              },
            ]}
          >
            {order.status === "delivered"
              ? "Delivered"
              : order.status === "cancelled"
                ? "Cancelled"
                : formatEta(order.minutesRemaining)}
          </Text>
          <Text
            style={[
              styles.heroSub,
              {
                color:
                  order.status === "cancelled"
                    ? colors.mutedForeground
                    : colors.primaryForeground + "CC",
              },
            ]}
          >
            {STATUS_LABELS[order.status]}
          </Text>
        </View>

        {/* Rider — only meaningful once the food has left the kitchen */}
        {order.status === "on_the_way" && (
          <View
            style={[
              styles.rider,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[styles.riderAvatar, { backgroundColor: colors.accent }]}
            >
              <Text
                style={[
                  styles.riderInitial,
                  { color: colors.accentForeground },
                ]}
              >
                Y
              </Text>
            </View>
            <View style={styles.riderBody}>
              <Text style={[styles.riderName, { color: colors.foreground }]}>
                Yaw Mensah
              </Text>
              <Text
                style={[styles.riderRole, { color: colors.mutedForeground }]}
              >
                Your rider · Okada
              </Text>
            </View>
            <View
              style={[styles.riderCall, { backgroundColor: colors.accent + "1F" }]}
            >
              <Feather name="phone" size={17} color={colors.accent} />
            </View>
          </View>
        )}

        {/* Progress */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Progress
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <OrderStatusTimeline status={order.status} />
        </View>

        {/* Items */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {order.items.length} {order.items.length === 1 ? "item" : "items"}
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {order.items.map((line, index) => {
            const img = IMAGE_MAP[line.item.imageName];
            return (
              <View
                key={line.item.id}
                style={[
                  styles.itemRow,
                  index > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                ]}
              >
                {img ? (
                  <Image source={img} style={styles.itemImage} resizeMode="cover" />
                ) : (
                  <View
                    style={[
                      styles.itemImage,
                      { backgroundColor: line.item.color },
                    ]}
                  />
                )}
                <View style={styles.itemBody}>
                  <Text
                    style={[styles.itemName, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {line.item.name}
                  </Text>
                  <Text
                    style={[styles.itemQty, { color: colors.mutedForeground }]}
                  >
                    {line.quantity} × {formatCedis(line.item.price)}
                  </Text>
                </View>
                <Text style={[styles.itemTotal, { color: colors.foreground }]}>
                  {formatCedis(line.item.price * line.quantity)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Delivery details */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Delivery
        </Text>
        <View
          style={[
            styles.card,
            styles.detailCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Detail icon="map-pin" label="Address" value={order.address} />
          {order.notes ? (
            <Detail icon="edit-3" label="Notes" value={order.notes} />
          ) : null}
          <Detail
            icon="credit-card"
            label="Payment"
            value={PAYMENT_LABELS[order.paymentMethod]}
          />
        </View>

        {/* Totals */}
        <View
          style={[
            styles.card,
            styles.totals,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TotalRow label="Subtotal" value={formatCedis(order.subtotal)} />
          <TotalRow
            label="Delivery Fee"
            value={
              order.deliveryFee === 0 ? "Free" : formatCedis(order.deliveryFee)
            }
          />
          {order.discount > 0 && (
            <TotalRow
              label="Discount"
              value={`- ${formatCedis(order.discount)}`}
              color={colors.success}
            />
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.grandLabel, { color: colors.foreground }]}>
              Total
            </Text>
            <Text style={[styles.grandValue, { color: colors.primary }]}>
              {formatCedis(order.total)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action bar */}
      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: botPad + 12,
          },
        ]}
      >
        {canCancel(order) ? (
          <Pressable
            onPress={handleCancel}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.outlineBtn,
              { borderColor: colors.destructive },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="x-circle" size={17} color={colors.destructive} />
            <Text style={[styles.outlineText, { color: colors.destructive }]}>
              Cancel order
            </Text>
          </Pressable>
        ) : isFinished ? (
          <Pressable
            onPress={handleReorder}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Feather
              name="refresh-ccw"
              size={17}
              color={colors.primaryForeground}
            />
            <Text
              style={[styles.primaryText, { color: colors.primaryForeground }]}
            >
              Reorder
            </Text>
          </Pressable>
        ) : (
          <View
            style={[styles.notice, { backgroundColor: colors.muted }]}
          >
            <Feather name="lock" size={15} color={colors.mutedForeground} />
            <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
              The kitchen has started — this order can no longer be cancelled
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.detailRow}>
      <Feather name={icon} size={16} color={colors.mutedForeground} />
      <View style={styles.detailBody}>
        <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text style={[styles.detailValue, { color: colors.foreground }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function TotalRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.totalValue, { color: color ?? colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  missing: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  hero: {
    borderRadius: 18,
    padding: 20,
  },
  heroLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.1,
  },
  heroValue: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    marginTop: 6,
  },
  heroSub: {
    fontSize: 13.5,
    fontFamily: "Inter_500Medium",
    marginTop: 3,
  },
  rider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
  },
  riderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  riderInitial: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  riderBody: { flex: 1 },
  riderName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  riderRole: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  riderCall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginTop: 26,
    marginBottom: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  detailCard: {
    gap: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  itemImage: {
    width: 46,
    height: 46,
    borderRadius: 10,
  },
  itemBody: { flex: 1 },
  itemName: {
    fontSize: 14.5,
    fontFamily: "Inter_600SemiBold",
  },
  itemQty: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  detailRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  detailBody: { flex: 1 },
  detailLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  totals: {
    marginTop: 14,
    gap: 9,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  totalValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: 1,
    marginVertical: 3,
  },
  grandLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  grandValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  actionBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    height: 52,
    borderRadius: 26,
  },
  primaryText: {
    fontSize: 15.5,
    fontFamily: "Inter_700Bold",
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
  },
  outlineText: {
    fontSize: 15.5,
    fontFamily: "Inter_600SemiBold",
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
  },
});
