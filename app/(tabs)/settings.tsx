import { useClerk, useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getAuthErrorMessage,
} from "@/lib/auth-validation";

export default function Settings() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setErrorMessage(null);
    try {
      await clerk.signOut();
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "We couldn't sign you out. Please check your connection and try again.",
        ),
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  if (!isLoaded || !user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel="Loading your account" />
      </SafeAreaView>
    );
  }

  const primaryEmail = user.primaryEmailAddress;
  const emailAddress = primaryEmail?.emailAddress ?? "";
  const isEmailVerified = primaryEmail?.verification.status === "verified";
  const displayName = user.fullName || user.username || "Your account";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-5">
        <Text className="text-3xl font-sans-bold text-primary">Settings</Text>

        <View className="mt-8 rounded-3xl border border-border bg-card p-5">
          <Text className="text-sm font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
            Account
          </Text>
          <View className="mt-5 flex-row items-center gap-4">
            {user.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="size-16 rounded-full"
                contentFit="cover"
                accessibilityLabel={`${displayName}'s profile photo`}
              />
            ) : (
              <View
                className="size-16 items-center justify-center rounded-full bg-accent"
                accessibilityLabel="Profile initials"
              >
                <Text className="text-xl font-sans-bold text-background">
                  {initials}
                </Text>
              </View>
            )}
            <View className="min-w-0 flex-1">
              <Text className="text-lg font-sans-bold text-primary">
                {displayName}
              </Text>
              <Text
                className="mt-1 text-sm font-sans-medium text-muted-foreground"
                numberOfLines={2}
              >
                {emailAddress}
              </Text>
              {isEmailVerified ? (
                <View className="mt-3 self-start rounded-full bg-success/10 px-3 py-1">
                  <Text className="text-xs font-sans-semibold text-success">
                    Email verified
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View className="mt-6 rounded-3xl border border-border bg-card p-5">
          <Text className="text-lg font-sans-bold text-primary">
            Sign out
          </Text>
          <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
            You can sign back in anytime with your email and password.
          </Text>
          {errorMessage ? (
            <Text className="mt-3 text-sm font-sans-medium text-destructive" accessibilityLiveRegion="polite">
              {errorMessage}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: isSigningOut,
              busy: isSigningOut,
            }}
            className="mt-5 items-center rounded-2xl border border-border py-4"
            disabled={isSigningOut}
            onPress={handleSignOut}
          >
            {isSigningOut ? (
              <ActivityIndicator accessibilityLabel="Signing out" />
            ) : (
              <Text className="text-base font-sans-bold text-primary">
                Sign out
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
