import { Feather, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
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

type SettingRowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightEl?: React.ReactNode;
};

function SettingRow({ icon, label, value, onPress, rightEl }: SettingRowProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
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
          <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
            {value}
          </Text>
        )}
      </View>
      {rightEl ?? (
        onPress && (
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        )
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orders } = useOrders();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const totalSpent = orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.totalPrice, 0);

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
          <Text style={styles.avatarText}>K</Text>
        </View>
        <View>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            Kwame Asante
          </Text>
          <Text style={[styles.userPhone, { color: colors.mutedForeground }]}>
            +233 24 000 0000
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Orders", value: orders.length.toString() },
          { label: "Completed", value: deliveredCount.toString() },
          { label: "Total Spent", value: `GH₵ ${totalSpent}` },
        ].map((s) => (
          <View
            key={s.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.statValue, { color: colors.primary }]}>
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
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow
          icon={<Feather name="user" size={16} color={colors.primary} />}
          label="Edit Profile"
          onPress={() => {}}
        />
        <SettingRow
          icon={<MaterialIcons name="location-on" size={16} color={colors.primary} />}
          label="Saved Addresses"
          onPress={() => {}}
        />
        <SettingRow
          icon={<Feather name="credit-card" size={16} color={colors.primary} />}
          label="Payment Methods"
          onPress={() => {}}
        />
      </View>

      {/* Preferences */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        PREFERENCES
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow
          icon={<Feather name="bell" size={16} color={colors.primary} />}
          label="Push Notifications"
          rightEl={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: colors.primary }}
            />
          }
        />
        <SettingRow
          icon={<Feather name="moon" size={16} color={colors.primary} />}
          label="Dark Mode"
          rightEl={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ true: colors.primary }}
            />
          }
        />
      </View>

      {/* Support */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        SUPPORT
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow
          icon={<Feather name="help-circle" size={16} color={colors.primary} />}
          label="Help & Support"
          onPress={() => {}}
        />
        <SettingRow
          icon={<Feather name="star" size={16} color={colors.primary} />}
          label="Rate the App"
          onPress={() => {}}
        />
        <SettingRow
          icon={<Feather name="info" size={16} color={colors.primary} />}
          label="About ASAP"
          value="Version 1.0.0"
        />
      </View>

      {/* Brand */}
      <View style={styles.brand}>
        <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
        <View style={[styles.brandDot, { backgroundColor: colors.secondary }]} />
        <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
        <Text style={[styles.brandName, { color: colors.primary }]}>
          ASAP
        </Text>
        <Text style={[styles.brandTag, { color: colors.mutedForeground }]}>
          Ghanaian Food Delivery
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  userName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  userPhone: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  rowValue: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  brand: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 4,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  brandName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 4,
  },
  brandTag: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
