import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { IMAGE_MAP, MenuItem } from "@/constants/menu";
import { useCart } from "@/context/CartContext";

type Props = {
  item: MenuItem;
  onPress: () => void;
};

export function FoodCard({ item, onPress }: Props) {
  const colors = useColors();
  const { addItem, items } = useCart();
  const cartEntry = items.find((c) => c.item.id === item.id);
  const qty = cartEntry?.quantity ?? 0;
  const img = IMAGE_MAP[item.imageName];

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem(item);
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={[styles.imageContainer, !img && { backgroundColor: item.color }]}>
        {img ? (
          <Image source={img} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: item.color }]}>
            <Text style={styles.placeholderEmoji}>🍽</Text>
            <Text style={styles.placeholderName}>{item.name}</Text>
          </View>
        )}
        {item.popular && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.primaryForeground }]}>
              Popular
            </Text>
          </View>
        )}
        {item.spicy && (
          <View style={[styles.spicyBadge, { backgroundColor: "#FF6B35" }]}>
            <Feather name="zap" size={10} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.name, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={[styles.desc, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        <View style={styles.footer}>
          <View>
            <Text style={[styles.price, { color: colors.primary }]}>
              GH₵ {item.price}
            </Text>
            <View style={styles.timeRow}>
              <MaterialIcons
                name="access-time"
                size={11}
                color={colors.mutedForeground}
              />
              <Text style={[styles.time, { color: colors.mutedForeground }]}>
                {item.prepTime} min
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            {qty > 0 ? (
              <Text style={styles.qtyText}>{qty}</Text>
            ) : (
              <Feather name="plus" size={18} color="#fff" />
            )}
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
    height: 160,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  placeholderName: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  spicyBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: 12,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  desc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 8,
  },
  price: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
