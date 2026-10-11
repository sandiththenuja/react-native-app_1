import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SubscriptionCard from "@/components/SubscriptionCard";
import { colors } from "@/constants/theme";
import { useSubscriptions } from "@/lib/subscription-store";

export default function Subscriptions() {
  const [searchQuery, setSearchQuery] = useState("");
  const subscriptions = useSubscriptions();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return subscriptions;

    return subscriptions.filter((subscription) =>
      [
        subscription.name,
        subscription.plan,
        subscription.category,
        subscription.paymentMethod,
        subscription.status,
        subscription.billing,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [searchQuery, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        contentContainerClassName="px-5 pb-28 pt-5"
        data={filteredSubscriptions}
        extraData={expandedSubscriptionId}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={
          <View className="items-center px-6 py-14">
            <View className="mb-4 size-14 items-center justify-center rounded-full bg-muted">
              <Ionicons
                name={searchQuery.trim() ? "search-outline" : "wallet-outline"}
                size={24}
                color={colors.mutedForeground}
              />
            </View>
            <Text className="text-center text-lg font-sans-bold text-primary">
              {searchQuery.trim()
                ? "No subscriptions found"
                : "No subscriptions yet"}
            </Text>
            <Text className="mt-2 text-center text-sm font-sans-medium text-muted-foreground">
              {searchQuery.trim()
                ? "Try another name, plan, category, or payment method."
                : "Your subscriptions will appear here once you add them."}
            </Text>
            {searchQuery.trim() ? (
              <Pressable
                accessibilityRole="button"
                className="mt-5 rounded-full bg-accent px-5 py-3"
                onPress={() => setSearchQuery("")}
              >
                <Text className="font-sans-semibold text-primary">
                  Clear search
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListHeaderComponent={
          <View className="mb-5">
            <Text className="text-3xl font-sans-bold text-primary">
              Subscriptions
            </Text>
            <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
              Find and review your recurring plans.
            </Text>

            <View className="subscription-search mt-6">
              <Ionicons
                name="search-outline"
                size={20}
                color={colors.mutedForeground}
              />
              <TextInput
                accessibilityLabel="Search subscriptions"
                accessibilityHint="Search by service, plan, category, status, billing period, or payment method."
                autoCapitalize="none"
                autoCorrect={false}
                className="subscription-search-input"
                onChangeText={setSearchQuery}
                placeholder="Search subscriptions"
                placeholderTextColor={colors.mutedForeground}
                returnKeyType="search"
                value={searchQuery}
              />
              {searchQuery.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  className="subscription-search-clear"
                  hitSlop={8}
                  onPress={() => setSearchQuery("")}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              ) : null}
            </View>

            <Text
              className="mt-5 text-sm font-sans-semibold text-muted-foreground"
              accessibilityLiveRegion="polite"
            >
              {filteredSubscriptions.length}{" "}
              {filteredSubscriptions.length === 1
                ? "subscription"
                : "subscriptions"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
