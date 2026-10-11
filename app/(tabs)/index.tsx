import { Image } from "expo-image";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import image from "@/constants/image";
import { HOME_BALANCE, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import { addSubscription, useSubscriptions } from "@/lib/subscription-store";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { posthog } from "@/lib/posthog";
import { posthogLogger } from "@/lib/posthog-logger";
import { useState } from "react";
 
export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)
  const subscriptions = useSubscriptions()
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)

  function handleSubscriptionDetailsToggle(subscriptionId: string) {
    const isExpanded = expandedSubscriptionId !== subscriptionId;
    posthog?.capture("subscription_details_toggled", { is_expanded: isExpanded });
    posthogLogger.info("subscription details state changed", {
      is_expanded: isExpanded,
    });
    setExpandedSubscriptionId(isExpanded ? subscriptionId : null);
  }

  function handleCreateSubscription(subscription: Subscription) {
    addSubscription(subscription);
    setExpandedSubscriptionId(null);
  }

  return (
    <SafeAreaView style={{flex: 1}}>
    <ScrollView className="flex-1 bg-background p-5">
      <View>
        <FlatList 
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={image.avatar} className="home-avatar" />
                <Text className="home-user-name">{HOME_USER.name}</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add subscription"
                className="home-add-button"
                onPress={() => setIsCreateModalVisible(true)}
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(
                    HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({item}) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
              />
            </View>

          <ListHeading title="All Subscriptions" />
          </>
        )}
          data={subscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => (
            <SubscriptionCard 
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() => handleSubscriptionDetailsToggle(item.id)} />
          )}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
          contentContainerClassName="pb-20"
        />
      </View>
    </ScrollView>
    <CreateSubscriptionModal
      visible={isCreateModalVisible}
      onClose={() => setIsCreateModalVisible(false)}
      onCreate={handleCreateSubscription}
    />
    </SafeAreaView>
  );
}