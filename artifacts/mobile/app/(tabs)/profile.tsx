import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useOrders } from "@/context/OrderContext";
import { useTheme, type ThemeMode } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { formatCedis } from "@/utils/format";

type SettingRowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightEl?: React.ReactNode;
  last?: boolean;
};

function SettingRow({
  icon,
  label,
  value,
  onPress,
  rightEl,
  last,
}: SettingRowProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border },
        pressed && onPress && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.muted }]}>
        {icon}
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>
          {label}
        </Text>
        {value && (
          <Text
            style={[styles.rowValue, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {value}
          </Text>
        )}
      </View>
      {rightEl ??
        (onPress && (
          <Feather
            name="chevron-right"
            size={18}
            color={colors.mutedForeground}
          />
        ))}
    </Pressable>
  );
}

const THEME_OPTIONS: { key: ThemeMode; label: string }[] = [
  { key: "system", label: "System" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orders } = useOrders();
  const { mode, setMode } = useTheme();
  const {
    profile,
    addresses,
    payments,
    defaultAddress,
    defaultPayment,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useUser();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const delivered = orders.filter((o) => o.status === "delivered");
  const totalSpent = delivered.reduce((sum, o) => sum + o.total, 0);
  const initial = profile.name.trim().charAt(0).toUpperCase() || "?";

  const stats = [
    { label: "Orders", value: orders.length.toString() },
    { label: "Completed", value: delivered.length.toString() },
    { label: "Total Spent", value: formatCedis(totalSpent) },
  ];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: topPad + 8, paddingBottom: botPad + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text
            style={[styles.avatarText, { color: colors.primaryForeground }]}
          >
            {initial}
          </Text>
        </View>
        <View style={styles.avatarText2}>
          <Text
            style={[styles.userName, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {profile.name}
          </Text>
          <Text
            style={[styles.userPhone, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {profile.phone}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/profile/edit")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          style={({ pressed }) => [
            styles.editBtn,
            { borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="edit-2" size={15} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View
            key={s.label}
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.statValue, { color: colors.primary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {s.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Account */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        ACCOUNT
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <SettingRow
          icon={<Feather name="user" size={16} color={colors.primary} />}
          label="Edit Profile"
          value={profile.email}
          onPress={() => router.push("/profile/edit")}
        />
        <SettingRow
          icon={
            <MaterialIcons name="location-on" size={16} color={colors.primary} />
          }
          label="Saved Addresses"
          value={
            defaultAddress
              ? `${addresses.length} saved · ${defaultAddress.label} is default`
              : "No addresses yet"
          }
          onPress={() => router.push("/profile/addresses")}
        />
        <SettingRow
          icon={<Feather name="credit-card" size={16} color={colors.primary} />}
          label="Payment Methods"
          value={
            defaultPayment
              ? `${payments.length} saved · ${defaultPayment.label}`
              : "No methods yet"
          }
          onPress={() => router.push("/profile/payment")}
          last
        />
      </View>

      {/* Appearance — a three-way choice, because "System" is a real option */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        APPEARANCE
      </Text>
      <View
        style={[
          styles.card,
          styles.appearanceCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.segmented, { backgroundColor: colors.muted }]}>
          {THEME_OPTIONS.map((option) => {
            const selected = mode === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setMode(option.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[
                  styles.segment,
                  selected && { backgroundColor: colors.card },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: selected
                        ? colors.foreground
                        : colors.mutedForeground,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Preferences */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        PREFERENCES
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <SettingRow
          icon={<Feather name="bell" size={16} color={colors.primary} />}
          label="Order Notifications"
          value="Status updates while your food is on the way"
          rightEl={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          }
          last
        />
      </View>

      {/* Support */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        SUPPORT
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <SettingRow
          icon={<Feather name="help-circle" size={16} color={colors.primary} />}
          label="Help & Support"
          value="hello@asap.gh · +233 30 000 0000"
        />
        <SettingRow
          icon={<Feather name="info" size={16} color={colors.primary} />}
          label="About ASAP"
          value="Version 1.0.0"
          last
        />
      </View>

      {/* Brand */}
      <View style={styles.brand}>
        <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
        <View style={[styles.brandDot, { backgroundColor: colors.secondary }]} />
        <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
        <Text style={[styles.brandName, { color: colors.primary }]}>ASAP</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  avatarText2: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  userPhone: {
    fontSize: 13.5,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11.5,
    fontFamily: "Inter_400Regular",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  appearanceCard: {
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14.5,
    fontFamily: "Inter_500Medium",
  },
  rowValue: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  segmented: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 11,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentText: {
    fontSize: 13.5,
    fontFamily: "Inter_600SemiBold",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  brandName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginLeft: 4,
  },
});
