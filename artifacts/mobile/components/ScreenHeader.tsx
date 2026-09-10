import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type Props = {
  title: string;
  subtitle?: string;
  /** Rendered on the trailing edge — a save button, a count, etc. */
  right?: React.ReactNode;
  onBack?: () => void;
};

/**
 * Header for the pushed (non-tab) screens. The tab screens keep their own
 * inline titles, so this is deliberately only used by the modal-ish stack.
 */
export function ScreenHeader({ title, subtitle, right, onBack }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) return router.back();
    router.replace("/(tabs)");
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: topPad + 8,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Pressable
        onPress={handleBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={({ pressed }) => [
          styles.backBtn,
          { backgroundColor: colors.muted },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Feather name="arrow-left" size={20} color={colors.foreground} />
      </Pressable>

      <View style={styles.titleWrap}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  right: {
    minWidth: 40,
    alignItems: "flex-end",
  },
});
