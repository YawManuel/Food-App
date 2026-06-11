import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { IMAGE_MAP, MENU_ITEMS } from "@/constants/menu";
import { useCart } from "@/context/CartContext";

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addItem, items } = useCart();
  const [qty, setQty] = useState(1);

  const item = MENU_ITEMS.find((m) => m.id === id);
  const cartEntry = items.find((c) => c.item.id === id);
  const img = item ? IMAGE_MAP[item.imageName] : null;

  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!item) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Item not found</Text>
      </View>
    );
  }

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    for (let i = 0; i < qty; i++) addItem(item);
    router.back();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          {img ? (
            <Image source={img} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: item.color }]}>
              <Text style={styles.placeholderEmoji}>🍽</Text>
              <Text style={styles.placeholderName}>{item.name}</Text>
            </View>
          )}
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.card }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          {item.popular && (
            <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {item.name}
            </Text>
            {item.spicy && (
              <View style={[styles.spicyTag, { backgroundColor: "#FF6B35" + "22" }]}>
                <Feather name="zap" size={12} color="#FF6B35" />
                <Text style={[styles.spicyText, { color: "#FF6B35" }]}>Spicy</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={14} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {item.prepTime} min
              </Text>
            </View>
            <View style={styles.metaSep} />
            <View style={[styles.categoryTag, { backgroundColor: colors.secondary + "33" }]}>
              <Text style={[styles.categoryText, { color: colors.foreground }]}>
                {item.category === "rice"
                  ? "Rice Dish"
                  : item.category === "soups"
                  ? "Soup & Stew"
                  : item.category === "grills"
                  ? "Grill"
                  : item.category === "street"
                  ? "Street Food"
                  : "Drink"}
              </Text>
            </View>
          </View>

          <Text style={[styles.desc, { color: colors.mutedForeground }]}>
            {item.description}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
            Quantity
          </Text>
          <View style={styles.qtyRow}>
            <Pressable
              onPress={() => {
                if (qty > 1) setQty((q) => q - 1);
              }}
              style={[styles.qtyBtn, { borderColor: colors.border }]}
            >
              <Feather name="minus" size={18} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.qtyNum, { color: colors.foreground }]}>{qty}</Text>
            <Pressable
              onPress={() => setQty((q) => q + 1)}
              style={[
                styles.qtyBtn,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Feather name="plus" size={18} color="#fff" />
            </Pressable>
          </View>

          {cartEntry && (
            <View
              style={[
                styles.inCartBadge,
                { backgroundColor: colors.success + "22" },
              ]}
            >
              <Feather name="check-circle" size={14} color={colors.success} />
              <Text style={[styles.inCartText, { color: colors.success }]}>
                {cartEntry.quantity} already in cart
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart Bar */}
      <View
        style={[
          styles.addBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: botPad + 16,
          },
        ]}
      >
        <View>
          <Text style={[styles.addBarLabel, { color: colors.mutedForeground }]}>
            Total
          </Text>
          <Text style={[styles.addBarPrice, { color: colors.primary }]}>
            GH₵ {item.price * qty}
          </Text>
        </View>
        <Pressable
          onPress={handleAdd}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Feather name="shopping-bag" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add to Cart</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  imageWrap: { position: "relative", height: 280 },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  placeholderEmoji: { fontSize: 60 },
  placeholderName: {
    fontSize: 18,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  popularBadge: {
    position: "absolute",
    bottom: 14,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  popularText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  content: {
    padding: 20,
    gap: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  spicyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  spicyText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  metaSep: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  desc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNum: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    minWidth: 30,
    textAlign: "center",
  },
  inCartBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inCartText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  addBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  addBarLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  addBarPrice: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 27,
  },
  addBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
