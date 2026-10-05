import { tabs } from "@/constants/data";
import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { View } from "react-native";
import clsx from 'clsx'
import {colors, components} from '@/constants/theme'
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabIconProps{
    focused: boolean
    icon: any
}


const TabIcon = ({focused, icon}: TabIconProps) => {
        return (
                <View className={clsx('tabs-pill', focused && 'tabs-active')}>
                    <Image source={icon}
                    className='tabs-glyph'
                    contentFit="contain" />
                </View>
        )
    }

const TabLayout = () => {
    const insets = useSafeAreaInsets()
    
    return (
            <Tabs screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Math.max(insets.bottom, components.tabBar.horizontalInset),
                    height: components.tabBar.height,
                    marginHorizontal: components.tabBar.horizontalInset,
                    borderRadius: components.tabBar.radius,
                    backgroundColor: colors.primary,
                    borderTopWidth: 0,
                    elevation: 0,
                },
                tabBarItemStyle: {
                    paddingVertical: components.tabBar.height / 2 - components.tabBar.iconFrame / 1.6
                },
                tabBarIconStyle: {
                    width: components.tabBar.iconFrame,
                    height: components.tabBar.iconFrame,
                    alignItems: 'center'
                }
                
            }}>
                {tabs.map((tab) => (
                    <Tabs.Screen
                        key={tab.name}
                        name={tab.name}
                        options={{
                            title: tab.title,
                            tabBarIcon: ({focused}) => (
                                <TabIcon focused={focused} icon={tab.icon} />
                            )
                        }} />
                ))}
            </Tabs>
    )
}

export default TabLayout