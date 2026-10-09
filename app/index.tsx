import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel="Loading your account" />
      </View>
    );
  }

  return (
    <Redirect href={isSignedIn ? "/(tabs)" : "/(auth)/sign-in"} />
  );
}
