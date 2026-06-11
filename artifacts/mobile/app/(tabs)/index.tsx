import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryPill } from "@/components/CategoryPill";
import { FoodCard } from "@/components/FoodCard";
import { useColors } from "@/hooks/useColors";
import { CATEGORIES, IMAGE_MAP, MENU_ITEMS } from "@/constants/menu";
import { useCart } from "@/context/CartContext";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const { totalItems } = useCart();

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchSearch =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, search]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bannerImg = IMAGE_MAP["jollof_rice"];

  return (
    <FlatList
      data={filteredItems}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.list,
        {
          paddingTop: topPad + 8,
          paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 90,
        },
      ]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.locationRow}>
                <MaterialIcons
                  name="location-on"
                  size={16}
                  color={colors.primary}
                />
                <Text
                  style={[styles.locationLabel, { color: colors.mutedForeground }]}
                >
                  Delivering to
                </Text>
              </View>
              <Text style={[styles.location, { color: colors.foreground }]}>
                Accra, Greater Accra
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(tabs)/cart")}
              style={[styles.cartBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="shopping-bag" size={20} color="#fff" />
              {totalItems > 0 && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Text style={styles.badgeText}>{totalItems}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Greeting */}
          <Text style={[styles.greeting, { color: colors.foreground }]}>
            What are you{"\n"}
            <Text style={{ color: colors.primary }}>craving today?</Text>
          </Text>

          {/* Search */}
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search Ghanaian dishes..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.searchInput, { color: colors.foreground }]}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>

          {/* Banner */}
          <View style={[styles.banner, { backgroundColor: colors.primary }]}>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTag}>LIMITED OFFER</Text>
              <Text style={styles.bannerTitle}>
                Free delivery{"\n"}on first order!
              </Text>
              <Pressable
                style={[
                  styles.bannerBtn,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text style={[styles.bannerBtnText, { color: "#1A1A1A" }]}>
                  Order Now
                </Text>
              </Pressable>
            </View>
            {bannerImg ? (
              <Image
                source={bannerImg}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.bannerImage,
                  { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, alignItems: "center", justifyContent: "center" },
                ]}
              >
                <Text style={{ fontSize: 50 }}>🍛</Text>
              </View>
            )}
          </View>

          {/* Categories */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat.id}
                label={cat.name}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(cat.id)}
              />
            ))}
          </ScrollView>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {selectedCategory === "all"
              ? "All Dishes"
              : CATEGORIES.find((c) => c.id === selectedCategory)?.name}
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {"  "}({filteredItems.length})
            </Text>
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <FoodCard
          item={item}
          onPress={() => router.push(`/item/${item.id}`)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Feather name="search" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No dishes found
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locationLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  location: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginTop: 2,
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
  },
  greeting: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    lineHeight: 36,
    marginBottom: 18,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  banner: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 24,
    height: 140,
  },
  bannerText: {
    flex: 1,
    gap: 6,
  },
  bannerTag: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    lineHeight: 27,
  },
  bannerBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 2,
  },
  bannerBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  bannerImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    position: "absolute",
    right: -10,
    top: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  count: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  categories: {
    paddingBottom: 18,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
