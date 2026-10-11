import { useAuth } from "@clerk/expo";
import { Image } from "expo-image";
import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import image from "@/constants/image";

export default function GetStarted() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel="Loading your account" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView className="get-started-safe-area">
      <ScrollView
        className="flex-1"
        contentContainerClassName="get-started-content"
        showsVerticalScrollIndicator={false}
      >
        <View className="get-started-brand">
          <Image
            source={require("@/assets/icons/logo.png")}
            className="get-started-logo"
            contentFit="cover"
            accessibilityLabel="Subscription tracker logo"
          />
          <Text className="get-started-brand-name">Subscript</Text>
        </View>

        <View className="get-started-artwork-frame">
          <Image
            source={image.splashPattern}
            className="get-started-artwork"
            contentFit="cover"
            accessibilityLabel="Colorful geometric pattern"
          />
        </View>

        <View className="get-started-copy">
          <Text className="get-started-eyebrow">
            A clearer way to keep track
          </Text>
          <Text className="get-started-title">
            Your subscriptions,{"\n"}all in one place.
          </Text>
          <Text className="get-started-subtitle">
            Stay on top of renewals, understand your recurring spend, and make
            every subscription count.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          className="auth-button get-started-button"
          onPress={() => router.push("/(auth)/sign-in")}
        >
          <Text className="auth-button-text">Get started</Text>
        </Pressable>

        <Text className="get-started-trust">
          Simple, secure, and built around your subscriptions.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
