import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
 
export default function App() {
  return (
    <SafeAreaView style={{flex: 1}}>
    <View className="flex-1 bg-background p-5">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="mt-4 rounded bg-black text-white p-4">Onboarding</Link>
      <Link href="/(auth)/sign-in" className="mt-4 rounded bg-black text-white p-4">Sign In</Link>
      <Link href="/(auth)/sign-up" className="mt-4 rounded bg-black text-white p-4">Sign Up</Link>

      <Link href='/subscriptions/spotify'>Spotify Subscription</Link>
      <Link href={{
        pathname: '/subscriptions/[id]',
        params: {id: "claude"},
      }}>Claude Max Subscription</Link>
    </View>
    </SafeAreaView>
  );
}