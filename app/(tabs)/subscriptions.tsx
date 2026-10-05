import { View, Text } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";

const Subscriptions = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <View className='flex-1 bg-background p-5'>
        <Text>Subscriptions</Text>
      </View>
    </SafeAreaView>
  )
}

export default Subscriptions