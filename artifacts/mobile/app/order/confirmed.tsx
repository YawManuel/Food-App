import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { PAYMENT_LABELS, useOrders } from "@/context/OrderContext";
import { formatCedis, formatEta } from "@/utils/format";

export default function OrderConfirmedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getOrder, hydrated } = useOrders();

  const order = getOrder(id);

  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(80),
      Animated.spring(pop, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, [pop]);

  // Deep-linked here with a bad id, or storage hasn't produced it.
  if (hydrated && !order) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.missing, { color: colors.mutedForeground }]}>
          We couldn&apos;t find that order.
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)/orders")}
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
        >
          <Text style={[styles.secondaryText, { color: colors.foreground }]}>
            View my orders
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!order) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const topPad = Platform.OS === "web" ? 40 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
          paddingTop: topPad + 24,
          paddingBottom: botPad + 20,
        },
      ]}
    >
      <View style={styles.body}>
        <Animated.View
          style={[
            styles.tickRing,
            {
              backgroundColor: colors.success + "1F",
              transform: [{ scale: pop }],
            },
          ]}
        >
          <View style={[styles.tick, { backgroundColor: colors.success }]}>
            <Feather name="check" size={38} color={colors.successForeground} />
          </View>
        </Animated.View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Order confirmed!
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Your food is on its way. We&apos;ll keep you posted at every step.
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Row label="Order number" value={order.code} strong />
          <Divider />
          <Row
            label="Arriving in"
            value={formatEta(order.minutesRemaining)}
            accent={colors.primary}
          />
          <Divider />
          <Row label="Delivering to" value={order.address} multiline />
          <Divider />
          <Row label="Payment" value={PAYMENT_LABELS[order.paymentMethod]} />
          <Divider />
          <Row label="Total paid" value={formatCedis(order.total)} strong />
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.replace(`/order/${order.id}`)}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Feather name="map-pin" size={18} color={colors.primaryForeground} />
          <Text
            style={[styles.primaryText, { color: colors.primaryForeground }]}
          >
            Track my order
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.secondaryBtn,
            { borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.secondaryText, { color: colors.foreground }]}>
            Back to menu
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  strong,
  accent,
  multiline,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: string;
  multiline?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={[styles.row, multiline && styles.rowStacked]}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.rowValue,
          multiline ? styles.rowValueStacked : styles.rowValueInline,
          { color: accent ?? colors.foreground },
          strong && styles.rowValueStrong,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 32,
  },
  missing: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tickRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  tick: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
    maxWidth: 320,
  },
  card: {
    alignSelf: "stretch",
    marginTop: 28,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 13,
  },
  rowStacked: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  rowLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  rowValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  rowValueInline: {
    flexShrink: 1,
    textAlign: "right",
  },
  rowValueStacked: {
    textAlign: "left",
  },
  rowValueStrong: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  divider: {
    height: 1,
  },
  actions: {
    gap: 10,
    paddingTop: 20,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    height: 54,
    borderRadius: 27,
  },
  primaryText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  secondaryBtn: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
