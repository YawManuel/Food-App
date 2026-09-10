import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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

type Filter = "active" | "past";

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeOrders, pastOrders, hydrated } = useOrders();
  const [filter, setFilter] = useState<Filter>("active");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const orders = filter === "active" ? activeOrders : pastOrders;
  const hasAnyOrders = activeOrders.length > 0 || pastOrders.length > 0;

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "active", label: "Active", count: activeOrders.length },
    { key: "past", label: "Past", count: pastOrders.length },
  ];

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={[
        styles.list,
        { paddingTop: topPad + 8, paddingBottom: botPad + 90 },
      ]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            My Orders
          </Text>

          {hasAnyOrders && (
            <View
              style={[styles.tabs, { backgroundColor: colors.muted }]}
              accessibilityRole="tablist"
            >
              {tabs.map((tab) => {
                const selected = filter === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setFilter(tab.key)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    style={[
                      styles.tab,
                      selected && { backgroundColor: colors.card },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        {
                          color: selected
                            ? colors.foreground
                            : colors.mutedForeground,
                        },
                      ]}
                    >
                      {tab.label}
                      {tab.count > 0 ? ` (${tab.count})` : ""}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <OrderCard
          order={item}
          onPress={() => router.push(`/order/${item.id}`)}
        />
      )}
      ListEmptyComponent={
        // Nothing to say until storage has been read — an empty state that
        // flashes and then fills in reads as a bug.
        hydrated ? (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <Feather
                name={filter === "active" ? "clock" : "package"}
                size={44}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {filter === "active" ? "No orders in progress" : "No past orders"}
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
            >
              {filter === "active"
                ? "Your live orders will show up here with delivery tracking."
                : "Delivered and cancelled orders land here."}
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)")}
              style={[styles.browseBtn, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[
                  styles.browseBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                Browse Menu
              </Text>
            </Pressable>
          </View>
        ) : null
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
    marginBottom: 16,
  },
  tabs: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
  },
  tabText: {
    fontSize: 13.5,
    fontFamily: "Inter_600SemiBold",
  },
  empty: {
    alignItems: "center",
    paddingTop: 50,
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
    lineHeight: 20,
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
