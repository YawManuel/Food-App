import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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

/** Ghanaian mobile numbers: +233 XX XXX XXXX, or the local 0XX form. */
const PHONE_PATTERN = /^(\+233|0)\s?\d{2}\s?\d{3}\s?\d{4}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "phone" | "email", string>>;

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useUser();

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [errors, setErrors] = useState<Errors>({});

  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const validate = (): Errors => {
    const next: Errors = {};

    if (name.trim().length < 2) {
      next.name = "Enter your full name";
    }
    if (!PHONE_PATTERN.test(phone.trim())) {
      next.phone = "Use a Ghanaian number, e.g. +233 24 123 4567";
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Enter a valid email address";
    }
    return next;
  };

  const handleSave = () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });
    router.back();
  };

  const dirty =
    name !== profile.name || phone !== profile.phone || email !== profile.email;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Edit Profile" />

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <Field
          label="Full name"
          icon="user"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setErrors((e) => ({ ...e, name: undefined }));
          }}
          placeholder="Kwame Asante"
          error={errors.name}
          autoCapitalize="words"
        />

        <Field
          label="Phone number"
          icon="phone"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            setErrors((e) => ({ ...e, phone: undefined }));
          }}
          placeholder="+233 24 123 4567"
          error={errors.phone}
          keyboardType="phone-pad"
        />

        <Field
          label="Email"
          icon="mail"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((e) => ({ ...e, email: undefined }));
          }}
          placeholder="you@example.com"
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          Your phone number is what the rider uses to reach you on delivery.
        </Text>
      </KeyboardAwareScrollViewCompat>

      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: botPad + 12,
          },
        ]}
      >
        <Pressable
          onPress={handleSave}
          disabled={!dirty}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: dirty ? colors.primary : colors.muted },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text
            style={[
              styles.saveText,
              {
                color: dirty ? colors.primaryForeground : colors.mutedForeground,
              },
            ]}
          >
            {dirty ? "Save changes" : "No changes"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  error?: string;
};

function Field({ label, icon, error, style, ...inputProps }: FieldProps) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.destructive : colors.border,
          },
        ]}
      >
        <Feather name={icon} size={16} color={colors.mutedForeground} />
        <TextInput
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { color: colors.foreground }, style]}
          {...inputProps}
        />
      </View>
      {error ? (
        <Text style={[styles.error, { color: colors.destructive }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13.5,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    fontFamily: "Inter_400Regular",
  },
  error: {
    fontSize: 12.5,
    fontFamily: "Inter_500Medium",
    marginTop: 6,
  },
  note: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
    marginTop: 4,
  },
  actionBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    fontSize: 15.5,
    fontFamily: "Inter_700Bold",
  },
});
