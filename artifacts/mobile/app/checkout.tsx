import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useOrders, PAYMENT_LABELS } from "@/context/OrderContext";
import { useUser } from "@/context/UserContext";
import { computeTotals, findPromo, type Promo } from "@/constants/pricing";
import { formatCedis } from "@/utils/format";

const PAYMENT_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> =
  {
    momo: "smartphone",
    card: "credit-card",
    cash: "dollar-sign",
  };

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, subtotal, clearCart, hydrated: cartHydrated } = useCart();
  const { placeOrder } = useOrders();
  const { addresses, payments, defaultAddress, defaultPayment } = useUser();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<Promo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Seed the pickers from the user's defaults once those have hydrated.
  useEffect(() => {
    setAddressId((prev) => prev ?? defaultAddress?.id ?? null);
  }, [defaultAddress]);

  useEffect(() => {
    setPaymentId((prev) => prev ?? defaultPayment?.id ?? null);
  }, [defaultPayment]);

  // Someone can empty the cart from the tab behind this screen, or land here
  // via a deep link with nothing in it.
  useEffect(() => {
    if (cartHydrated && items.length === 0 && !placing) {
      router.replace("/(tabs)/cart");
    }
  }, [cartHydrated, items.length, placing]);

  const address = addresses.find((a) => a.id === addressId) ?? null;
  const payment = payments.find((p) => p.id === paymentId) ?? null;

  const totals = useMemo(() => computeTotals(subtotal, promo), [subtotal, promo]);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const found = findPromo(code);
    if (!found) {
      setPromo(null);
      setPromoError(`"${code}" isn't a valid code`);
      return;
    }
    if (subtotal < found.minSubtotal) {
      setPromo(null);
      setPromoError(
        `${found.code} needs a subtotal of ${formatCedis(found.minSubtotal)} or more`,
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPromo(found);
    setPromoError(null);
  };

  const clearPromo = () => {
    setPromo(null);
    setPromoInput("");
    setPromoError(null);
  };

  const canPlace = Boolean(address && payment) && items.length > 0 && !placing;

  const handlePlaceOrder = async () => {
    if (!address || !payment || !canPlace) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPlacing(true);

    // Stands in for the network round-trip the API server will eventually do.
    await new Promise((resolve) => setTimeout(resolve, 800));

    const order = placeOrder({
      items,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      discount: totals.discount,
      total: totals.total,
      address: [address.line, address.landmark].filter(Boolean).join(" — "),
      notes: notes.trim() || undefined,
      paymentMethod: payment.type,
    });

    clearCart();
    router.replace({ pathname: "/order/confirmed", params: { id: order.id } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Checkout"
        subtitle={`${items.length} ${items.length === 1 ? "item" : "items"}`}
      />

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 130 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------------------------------------------- Address */}
        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Delivery Address
          </Text>
          <Pressable
            onPress={() => router.push("/profile/addresses")}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.link, { color: colors.primary }]}>Manage</Text>
          </Pressable>
        </View>

        {addresses.length === 0 ? (
          <Pressable
            onPress={() => router.push("/profile/addresses")}
            style={[
              styles.emptySlot,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Feather name="plus-circle" size={18} color={colors.primary} />
            <Text style={[styles.emptySlotText, { color: colors.foreground }]}>
              Add a delivery address
            </Text>
          </Pressable>
        ) : (
          addresses.map((a) => {
            const selected = a.id === addressId;
            return (
              <Pressable
                key={a.id}
                onPress={() => setAddressId(a.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[
                  styles.option,
                  {
                    backgroundColor: colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                  selected && { borderWidth: 2 },
                ]}
              >
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: colors.primary + "18" },
                  ]}
                >
                  <Feather name="map-pin" size={16} color={colors.primary} />
                </View>
                <View style={styles.optionBody}>
                  <Text
                    style={[styles.optionTitle, { color: colors.foreground }]}
                  >
                    {a.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionDetail,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {a.line}
                    {a.landmark ? ` — ${a.landmark}` : ""}
                  </Text>
                </View>
                <Radio selected={selected} />
              </Pressable>
            );
          })
        )}

        {/* ------------------------------------------------------ Notes */}
        <Text
          style={[styles.sectionTitle, styles.sectionSpaced, { color: colors.foreground }]}
        >
          Delivery Notes
        </Text>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="edit-3" size={16} color={colors.mutedForeground} />
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Gate code, landmark, call on arrival…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            multiline
          />
        </View>

        {/* ---------------------------------------------------- Payment */}
        <View style={[styles.sectionHead, styles.sectionSpaced]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Payment Method
          </Text>
          <Pressable
            onPress={() => router.push("/profile/payment")}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.link, { color: colors.primary }]}>Manage</Text>
          </Pressable>
        </View>

        {payments.map((p) => {
          const selected = p.id === paymentId;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPaymentId(p.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.option,
                {
                  backgroundColor: colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                },
                selected && { borderWidth: 2 },
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: colors.accent + "18" },
                ]}
              >
                <Feather
                  name={PAYMENT_ICONS[p.type] ?? "credit-card"}
                  size={16}
                  color={colors.accent}
                />
              </View>
              <View style={styles.optionBody}>
                <Text style={[styles.optionTitle, { color: colors.foreground }]}>
                  {p.label}
                </Text>
                <Text
                  style={[
                    styles.optionDetail,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {p.detail}
                </Text>
              </View>
              <Radio selected={selected} />
            </Pressable>
          );
        })}

        {/* ------------------------------------------------------ Promo */}
        <Text
          style={[styles.sectionTitle, styles.sectionSpaced, { color: colors.foreground }]}
        >
          Promo Code
        </Text>

        {promo ? (
          <View
            style={[
              styles.promoApplied,
              {
                backgroundColor: colors.success + "1A",
                borderColor: colors.success + "55",
              },
            ]}
          >
            <Feather name="tag" size={16} color={colors.success} />
            <View style={styles.optionBody}>
              <Text style={[styles.optionTitle, { color: colors.foreground }]}>
                {promo.code} applied
              </Text>
              <Text
                style={[styles.optionDetail, { color: colors.mutedForeground }]}
              >
                {promo.description} · saving {formatCedis(totals.discount)}
              </Text>
            </View>
            <Pressable onPress={clearPromo} hitSlop={8}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.promoRow}>
            <View
              style={[
                styles.inputWrap,
                styles.promoInput,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Feather name="tag" size={16} color={colors.mutedForeground} />
              <TextInput
                value={promoInput}
                onChangeText={(text) => {
                  setPromoInput(text);
                  setPromoError(null);
                }}
                onSubmitEditing={applyPromo}
                placeholder="Try ASAP10"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                style={[styles.input, { color: colors.foreground }]}
              />
            </View>
            <Pressable
              onPress={applyPromo}
              disabled={!promoInput.trim()}
              style={({ pressed }) => [
                styles.promoBtn,
                {
                  backgroundColor: promoInput.trim()
                    ? colors.primary
                    : colors.muted,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                style={[
                  styles.promoBtnText,
                  {
                    color: promoInput.trim()
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                  },
                ]}
              >
                Apply
              </Text>
            </Pressable>
          </View>
        )}

        {promoError && (
          <Text style={[styles.error, { color: colors.destructive }]}>
            {promoError}
          </Text>
        )}

        {/* ---------------------------------------------------- Summary */}
        <View
          style={[
            styles.summary,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>
            Order Summary
          </Text>

          <SummaryRow label="Subtotal" value={formatCedis(totals.subtotal)} />
          <SummaryRow
            label="Delivery Fee"
            value={
              totals.deliveryFee === 0 ? "Free" : formatCedis(totals.deliveryFee)
            }
            highlight={totals.deliveryFee === 0 ? colors.success : undefined}
          />
          {totals.discount > 0 && (
            <SummaryRow
              label={`Discount (${promo?.code})`}
              value={`- ${formatCedis(totals.discount)}`}
              highlight={colors.success}
            />
          )}

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

          {payment && (
            <Text style={[styles.payNote, { color: colors.mutedForeground }]}>
              Paying with {PAYMENT_LABELS[payment.type]}
            </Text>
          )}
        </View>
      </KeyboardAwareScrollViewCompat>

      {/* ------------------------------------------------------- Action */}
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
        {!address && (
          <Text style={[styles.blocked, { color: colors.destructive }]}>
            Choose a delivery address to continue
          </Text>
        )}
        <Pressable
          onPress={handlePlaceOrder}
          disabled={!canPlace}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.placeBtn,
            { backgroundColor: canPlace ? colors.primary : colors.muted },
            pressed && { opacity: 0.85 },
          ]}
        >
          {placing ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Text
                style={[
                  styles.placeBtnText,
                  {
                    color: canPlace
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                  },
                ]}
              >
                Place Order · {formatCedis(totals.total)}
              </Text>
              <Feather
                name="arrow-right"
                size={20}
                color={canPlace ? colors.primaryForeground : colors.mutedForeground}
              />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function Radio({ selected }: { selected: boolean }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.radio,
        { borderColor: selected ? colors.primary : colors.border },
      ]}
    >
      {selected && (
        <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />
      )}
    </View>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[styles.summaryValue, { color: highlight ?? colors.foreground }]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionSpaced: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 10,
  },
  link: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  optionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  optionBody: { flex: 1 },
  optionTitle: {
    fontSize: 14.5,
    fontFamily: "Inter_600SemiBold",
  },
  optionDetail: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptySlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptySlotText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  inputWrap: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 22,
  },
  promoRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "stretch",
  },
  promoInput: {
    flex: 1,
    alignItems: "center",
  },
  promoBtn: {
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  promoBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  promoApplied: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  error: {
    fontSize: 12.5,
    fontFamily: "Inter_500Medium",
    marginTop: 8,
  },
  summary: {
    marginTop: 24,
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
  payNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  actionBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  blocked: {
    fontSize: 12.5,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    marginBottom: 8,
  },
  placeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    borderRadius: 27,
  },
  placeBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
