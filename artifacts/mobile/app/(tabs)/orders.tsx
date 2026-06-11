import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OrderCard } from "@/components/OrderCard";
import { useColors } from "@/hooks/useColors";
import { useOrders } from "@/context/OrderContext";

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orders } = useOrders();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={[
        styles.list,
        {
          paddingTop: topPad + 8,
          paddingBottom: botPad + 90,
        },
      ]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Text style={[styles.title, { color: colors.foreground }]}>
          My Orders
        </Text>
      }
      renderItem={({ item }) => <OrderCard order={item} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <View
            style={[styles.emptyIcon, { backgroundColor: colors.primary + "15" }]}
          >
            <Feather name="package" size={44} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No orders yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Order some amazing Ghanaian food!
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/")}
            style={[styles.browseBtn, { backgroundColor: colors.primary }]}
          >
            <Text
              style={[styles.browseBtnText, { color: colors.primaryForeground }]}
            >
              Browse Menu
            </Text>
          </Pressable>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
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
    paddingHorizontal: 20,
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
