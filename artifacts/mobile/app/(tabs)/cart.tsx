import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CartItemRow } from "@/components/CartItemRow";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrderContext";

const DELIVERY_FEE = 10;

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, totalPrice, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const grandTotal = totalPrice + (items.length > 0 ? DELIVERY_FEE : 0);

  const handleCheckout = async () => {
    if (!address.trim()) {
      Alert.alert("Enter Address", "Please enter your delivery address.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 800));
    placeOrder(items, grandTotal, address.trim());
    clearCart();
    setPlacing(false);
    router.push("/(tabs)/orders");
  };

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
          <Text style={[styles.browseBtnText, { color: colors.primaryForeground }]}>
            Browse Menu
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: topPad + 8,
            paddingBottom: botPad + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          Your Cart
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {"  "}{items.length} {items.length === 1 ? "item" : "items"}
          </Text>
        </Text>

        {items.map((ci) => (
          <CartItemRow key={ci.item.id} cartItem={ci} />
        ))}

        {/* Delivery Address */}
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          Delivery Address
        </Text>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="map-pin" size={16} color={colors.mutedForeground} />
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your delivery address..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            multiline
          />
        </View>

        {/* Summary */}
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
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              Subtotal
            </Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              GH₵ {totalPrice}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              Delivery Fee
            </Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              GH₵ {DELIVERY_FEE}
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
              GH₵ {grandTotal}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View
        style={[
          styles.checkoutBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: botPad + 16,
          },
        ]}
      >
        <Pressable
          onPress={handleCheckout}
          disabled={placing}
          style={({ pressed }) => [
            styles.checkoutBtn,
            { backgroundColor: colors.primary },
            (pressed || placing) && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.checkoutText}>
            {placing ? "Placing Order..." : `Place Order · GH₵ ${grandTotal}`}
          </Text>
          {!placing && <Feather name="arrow-right" size={20} color="#fff" />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },
  count: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 10,
    marginTop: 8,
  },
  inputWrap: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "flex-start",
    marginBottom: 18,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 40,
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
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
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
    color: "#fff",
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
