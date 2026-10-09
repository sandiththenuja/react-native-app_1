import { Image } from "expo-image";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthScreen({
  title,
  subtitle,
  children,
  footer,
}: AuthScreenProps) {
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <Image
              source={require("@/assets/icons/logo.png")}
              className="auth-logo-image"
              contentFit="cover"
              accessibilityLabel="Recurring subscriptions logo"
            />
            <Text className="auth-wordmark-sub">Subscriptions, made clear</Text>
          </View>

          <View className="mt-8">
            <Text className="auth-title text-center" accessibilityRole="header">
              {title}
            </Text>
            <Text className="auth-subtitle">{subtitle}</Text>
          </View>

          <View className="auth-card">{children}</View>

          {footer ? <View className="auth-link-row">{footer}</View> : null}

          <Text className="auth-trust-copy">
            Your account is protected with secure sign-in and verified email.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
