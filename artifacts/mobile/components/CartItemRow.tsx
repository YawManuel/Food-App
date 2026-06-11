import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { CartItem, useCart } from "@/context/CartContext";
import { IMAGE_MAP } from "@/constants/menu";

type Props = {
  cartItem: CartItem;
};

export function CartItemRow({ cartItem }: Props) {
  const colors = useColors();
  const { updateQuantity } = useCart();
  const img = IMAGE_MAP[cartItem.item.imageName];

  const dec = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(cartItem.item.id, cartItem.quantity - 1);
  };

  const inc = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(cartItem.item.id, cartItem.quantity + 1);
  };

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {img ? (
        <Image source={img} style={styles.image} resizeMode="cover" />
      ) : (
        <View
          style={[styles.image, styles.placeholder, { backgroundColor: cartItem.item.color }]}
        >
          <Text style={styles.placeholderEmoji}>🍽</Text>
        </View>
      )}
      <View style={styles.details}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {cartItem.item.name}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          GH₵ {cartItem.item.price * cartItem.quantity}
        </Text>
        <View style={styles.controls}>
          <Pressable
            onPress={dec}
            style={[styles.qtyBtn, { borderColor: colors.border }]}
          >
            <Feather
              name={cartItem.quantity === 1 ? "trash-2" : "minus"}
              size={14}
              color={
                cartItem.quantity === 1 ? colors.destructive : colors.foreground
              }
            />
          </Pressable>
          <Text style={[styles.qty, { color: colors.foreground }]}>
            {cartItem.quantity}
          </Text>
          <Pressable
            onPress={inc}
            style={[styles.qtyBtn, { borderColor: colors.border }]}
          >
            <Feather name="plus" size={14} color={colors.foreground} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  image: {
    width: 90,
    height: 90,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderEmoji: {
    fontSize: 28,
  },
  details: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  price: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    minWidth: 20,
    textAlign: "center",
  },
});
