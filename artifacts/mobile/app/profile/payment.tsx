import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
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
import type { PaymentMethod } from "@/context/OrderContext";
import { useUser } from "@/context/UserContext";

const TYPE_ICONS: Record<
  PaymentMethod,
  React.ComponentProps<typeof Feather>["name"]
> = {
  momo: "smartphone",
  card: "credit-card",
  cash: "dollar-sign",
};

/** Only these two can be added — "cash on delivery" is seeded and singular. */
const ADDABLE: { type: PaymentMethod; label: string; hint: string }[] = [
  { type: "momo", label: "Mobile Money", hint: "+233 24 123 4567" },
  { type: "card", label: "Card", hint: "Last 4 digits, e.g. 4242" },
];

const MOMO_PATTERN = /^(\+233|0)\s?\d{2}\s?\d{3}\s?\d{4}$/;
const LAST4_PATTERN = /^\d{4}$/;

export default function PaymentMethodsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { payments, addPayment, removePayment, setDefaultPayment } = useUser();

  const [adding, setAdding] = useState<PaymentMethod | null>(null);
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const closeForm = () => {
    setAdding(null);
    setDetail("");
    setError(null);
  };

  const handleAdd = () => {
    if (!adding) return;
    const value = detail.trim();

    if (adding === "momo") {
      if (!MOMO_PATTERN.test(value)) {
        setError("Enter a Ghanaian mobile money number");
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addPayment({ type: "momo", label: "Mobile Money", detail: value });
    } else {
      if (!LAST4_PATTERN.test(value)) {
        setError("Enter the last 4 digits of the card");
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addPayment({
        type: "card",
        label: "Card",
        detail: `•••• •••• •••• ${value}`,
      });
    }

    closeForm();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Payment Methods"
        subtitle={`${payments.length} saved`}
      />

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {payments.map((method) => (
          <View
            key={method.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: method.isDefault ? colors.primary : colors.border,
              },
              method.isDefault && { borderWidth: 2 },
            ]}
          >
            <View style={styles.cardHead}>
              <View
                style={[
                  styles.cardIcon,
                  { backgroundColor: colors.accent + "18" },
                ]}
              >
                <Feather
                  name={TYPE_ICONS[method.type]}
                  size={16}
                  color={colors.accent}
                />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.labelRow}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                    {method.label}
                  </Text>
                  {method.isDefault && (
                    <View
                      style={[
                        styles.defaultTag,
                        { backgroundColor: colors.primary + "1F" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.defaultTagText,
                          { color: colors.primary },
                        ]}
                      >
                        Default
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.cardLine, { color: colors.mutedForeground }]}
                >
                  {method.detail}
                </Text>
              </View>
            </View>

            <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
              <Pressable
                onPress={() => setDefaultPayment(method.id)}
                disabled={method.isDefault}
                style={({ pressed }) => [
                  styles.action,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Feather
                  name="check-circle"
                  size={14}
                  color={
                    method.isDefault ? colors.mutedForeground : colors.accent
                  }
                />
                <Text
                  style={[
                    styles.actionText,
                    {
                      color: method.isDefault
                        ? colors.mutedForeground
                        : colors.accent,
                    },
                  ]}
                >
                  {method.isDefault ? "Default" : "Set as default"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => removePayment(method.id)}
                // Leaving the user with nothing to pay by would break checkout.
                disabled={payments.length === 1}
                style={({ pressed }) => [
                  styles.action,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Feather
                  name="trash-2"
                  size={14}
                  color={
                    payments.length === 1
                      ? colors.mutedForeground
                      : colors.destructive
                  }
                />
                <Text
                  style={[
                    styles.actionText,
                    {
                      color:
                        payments.length === 1
                          ? colors.mutedForeground
                          : colors.destructive,
                    },
                  ]}
                >
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        ))}

        {adding ? (
          <View
            style={[
              styles.form,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.formTitle, { color: colors.foreground }]}>
              Add {adding === "momo" ? "Mobile Money" : "Card"}
            </Text>

            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: colors.background,
                  borderColor: error ? colors.destructive : colors.border,
                },
              ]}
            >
              <Feather
                name={TYPE_ICONS[adding]}
                size={16}
                color={colors.mutedForeground}
              />
              <TextInput
                value={detail}
                onChangeText={(text) => {
                  setDetail(text);
                  setError(null);
                }}
                placeholder={
                  ADDABLE.find((a) => a.type === adding)?.hint ?? ""
                }
                placeholderTextColor={colors.mutedForeground}
                keyboardType={adding === "momo" ? "phone-pad" : "number-pad"}
                maxLength={adding === "card" ? 4 : undefined}
                style={[styles.input, { color: colors.foreground }]}
              />
            </View>

            {error ? (
              <Text style={[styles.error, { color: colors.destructive }]}>
                {error}
              </Text>
            ) : null}

            <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
              This is a demo — nothing is sent anywhere and no real card details
              are stored.
            </Text>

            <View style={styles.formActions}>
              <Pressable
                onPress={closeForm}
                style={({ pressed }) => [
                  styles.cancelBtn,
                  { borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.cancelText, { color: colors.foreground }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleAdd}
                style={({ pressed }) => [
                  styles.saveBtn,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[styles.saveText, { color: colors.primaryForeground }]}
                >
                  Save method
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.addRow}>
            {ADDABLE.map((option) => (
              <Pressable
                key={option.type}
                onPress={() => setAdding(option.type)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.addBtn,
                  { borderColor: colors.primary },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather
                  name={TYPE_ICONS[option.type]}
                  size={17}
                  color={colors.primary}
                />
                <Text style={[styles.addText, { color: colors.primary }]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardHead: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  defaultTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultTagText: {
    fontSize: 10.5,
    fontFamily: "Inter_600SemiBold",
  },
  cardLine: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
  },
  actionText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  addRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  addBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  addText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  form: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  formTitle: {
    fontSize: 15.5,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 11,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  error: {
    fontSize: 12.5,
    fontFamily: "Inter_500Medium",
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    flex: 1.4,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
