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
import { useUser } from "@/context/UserContext";

export default function AddressesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addresses, addAddress, removeAddress, setDefaultAddress } = useUser();

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [line, setLine] = useState("");
  const [landmark, setLandmark] = useState("");
  const [error, setError] = useState<string | null>(null);

  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const resetForm = () => {
    setLabel("");
    setLine("");
    setLandmark("");
    setError(null);
  };

  const handleAdd = () => {
    if (label.trim().length < 2) {
      setError("Give this address a short label, like Home or Office");
      return;
    }
    if (line.trim().length < 5) {
      setError("Enter the street and area");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addAddress({
      label: label.trim(),
      line: line.trim(),
      landmark: landmark.trim() || undefined,
    });
    resetForm();
    setAdding(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Saved Addresses"
        subtitle={`${addresses.length} saved`}
      />

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {addresses.length === 0 && !adding && (
          <View style={styles.empty}>
            <Feather name="map-pin" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No saved addresses yet. Add one so checkout is a single tap.
            </Text>
          </View>
        )}

        {addresses.map((address) => (
          <View
            key={address.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: address.isDefault ? colors.primary : colors.border,
              },
              address.isDefault && { borderWidth: 2 },
            ]}
          >
            <View style={styles.cardHead}>
              <View
                style={[
                  styles.cardIcon,
                  { backgroundColor: colors.primary + "18" },
                ]}
              >
                <Feather name="map-pin" size={16} color={colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.labelRow}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                    {address.label}
                  </Text>
                  {address.isDefault && (
                    <View
                      style={[
                        styles.defaultTag,
                        { backgroundColor: colors.primary + "1F" },
                      ]}
                    >
                      <Text
                        style={[styles.defaultTagText, { color: colors.primary }]}
                      >
                        Default
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.cardLine, { color: colors.mutedForeground }]}
                >
                  {address.line}
                </Text>
                {address.landmark ? (
                  <Text
                    style={[
                      styles.cardLandmark,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {address.landmark}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
              <Pressable
                onPress={() => setDefaultAddress(address.id)}
                disabled={address.isDefault}
                style={({ pressed }) => [
                  styles.action,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Feather
                  name="check-circle"
                  size={14}
                  color={
                    address.isDefault ? colors.mutedForeground : colors.accent
                  }
                />
                <Text
                  style={[
                    styles.actionText,
                    {
                      color: address.isDefault
                        ? colors.mutedForeground
                        : colors.accent,
                    },
                  ]}
                >
                  {address.isDefault ? "Default" : "Set as default"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => removeAddress(address.id)}
                style={({ pressed }) => [
                  styles.action,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Feather name="trash-2" size={14} color={colors.destructive} />
                <Text
                  style={[styles.actionText, { color: colors.destructive }]}
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
              New address
            </Text>

            <FormInput
              icon="tag"
              value={label}
              onChangeText={(text) => {
                setLabel(text);
                setError(null);
              }}
              placeholder="Label — Home, Office…"
              autoCapitalize="words"
            />
            <FormInput
              icon="map-pin"
              value={line}
              onChangeText={(text) => {
                setLine(text);
                setError(null);
              }}
              placeholder="Street and area, e.g. 12 Ring Road East, Osu"
            />
            <FormInput
              icon="navigation"
              value={landmark}
              onChangeText={setLandmark}
              placeholder="Landmark (optional)"
            />

            {error ? (
              <Text style={[styles.error, { color: colors.destructive }]}>
                {error}
              </Text>
            ) : null}

            <View style={styles.formActions}>
              <Pressable
                onPress={() => {
                  resetForm();
                  setAdding(false);
                }}
                style={({ pressed }) => [
                  styles.cancelBtn,
                  { borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[styles.cancelText, { color: colors.foreground }]}
                >
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
                  style={[
                    styles.saveText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  Save address
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setAdding(true)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.addBtn,
              { borderColor: colors.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="plus" size={18} color={colors.primary} />
            <Text style={[styles.addText, { color: colors.primary }]}>
              Add new address
            </Text>
          </Pressable>
        )}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function FormInput({
  icon,
  ...props
}: React.ComponentProps<typeof TextInput> & {
  icon: React.ComponentProps<typeof Feather>["name"];
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.inputWrap,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      <Feather name={icon} size={16} color={colors.mutedForeground} />
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, { color: colors.foreground }]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  empty: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
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
  cardLandmark: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    fontStyle: "italic",
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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginTop: 4,
  },
  addText: {
    fontSize: 14.5,
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
