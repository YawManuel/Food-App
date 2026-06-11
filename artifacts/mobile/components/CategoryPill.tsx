import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function CategoryPill({ label, selected, onPress }: Props) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: selected ? colors.primaryForeground : colors.mutedForeground,
            fontFamily: selected ? "Inter_600SemiBold" : "Inter_400Regular",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 13,
  },
});
