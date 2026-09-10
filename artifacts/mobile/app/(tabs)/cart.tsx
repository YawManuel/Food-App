import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CartItemRow } from "@/components/CartItemRow";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import {
  FREE_DELIVERY_THRESHOLD,
  computeTotals,
  deliveryFeeFor,
} from "@/constants/pricing";
import { formatCedis } from "@/utils/format";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, subtotal, totalItems, clearCart } = useCart();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const tabBarHeight = Platform.OS === "web" ? 84 : 56 + insets.bottom;

  // Address, payment and promo now live on the checkout screen, so the cart
  // shows the pre-promo total only.
  const totals = computeTotals(subtotal);
  const awayFromFreeDelivery = FREE_DELIVERY_THRESHOLD - subtotal;

  if (items.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          {
            backgroundColor: colors.background,
            paddingTop: topPad + 60,
            paddingBottom: botPad + 80,
          },
        ]}
      >
        <View
          style={[styles.emptyIcon, { backgroundColor: colors.primary + "15" }]}
        >
          <Feather name="shopping-bag" size={44} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          Your cart is empty
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
          Add some delicious Ghanaian dishes!
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)")}
          style={[styles.browseBtn, { backgroundColor: colors.primary }]}
        >
          <Text
            style={[styles.browseBtnText, { color: colors.primaryForeground }]}
          >
            Browse Menu
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 8, paddingBottom: tabBarHeight + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Your Cart
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {"  "}
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </Text>
          </Text>
          <Pressable
            onPress={clearCart}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear cart"
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.clear, { color: colors.destructive }]}>
              Clear
            </Text>
          </Pressable>
        </View>

        {items.map((ci) => (
          <CartItemRow key={ci.item.id} cartItem={ci} />
        ))}

        {/* Nudge toward the free-delivery threshold */}
        {awayFromFreeDelivery > 0 ? (
          <View
            style={[
              styles.nudge,
              {
                backgroundColor: colors.secondary + "22",
                borderColor: colors.secondary + "55",
              },
            ]}
          >
            <Feather name="truck" size={15} color={colors.foreground} />
            <Text style={[styles.nudgeText, { color: colors.foreground }]}>
              Add {formatCedis(awayFromFreeDelivery)} more for free delivery
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.nudge,
              {
                backgroundColor: colors.success + "1E",
                borderColor: colors.success + "55",
              },
            ]}
          >
            <Feather name="check-circle" size={15} color={colors.success} />
            <Text style={[styles.nudgeText, { color: colors.foreground }]}>
              You&apos;ve unlocked free delivery
            </Text>
          </View>
        )}

        <View
          style={[
            styles.summary,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>
            Order Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: colors.mutedForeground }]}
            >
              Subtotal
            </Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              {formatCedis(totals.subtotal)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: colors.mutedForeground }]}
            >
              Delivery Fee
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    deliveryFeeFor(subtotal) === 0
                      ? colors.success
                      : colors.foreground,
                },
              ]}
            >
              {deliveryFeeFor(subtotal) === 0
                ? "Free"
                : formatCedis(totals.deliveryFee)}
            </Text>
          </View>

          <View
            style={[styles.summaryDivider, { backgroundColor: colors.border }]}
          />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatCedis(totals.total)}
            </Text>
          </View>

          <Text style={[styles.summaryNote, { color: colors.mutedForeground }]}>
            Promo codes are applied at checkout.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.checkoutBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            bottom: tabBarHeight,
          },
        ]}
      >
        <Pressable
          onPress={() => router.push("/checkout")}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.checkoutBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text
            style={[styles.checkoutText, { color: colors.primaryForeground }]}
          >
            Checkout · {formatCedis(totals.total)}
          </Text>
          <Feather
            name="arrow-right"
            size={20}
            color={colors.primaryForeground}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  count: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  clear: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  nudge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 18,
  },
  nudgeText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  summary: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  summaryDivider: {
    height: 1,
    marginVertical: 4,
  },
  summaryNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  checkoutBar: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    borderRadius: 27,
  },
  checkoutText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  browseBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 27,
  },
  browseBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
