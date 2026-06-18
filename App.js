// App.js — 入口：底部 Tab 导航（首页 / 分析 / 我的）+ AA 工具 Stack
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from './src/components/Icon';
import { T } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import AAScreen from './src/screens/AAScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICON = { Home: 'house', Analysis: 'chart', Profile: 'users' };
const TAB_LABEL = { Home: '首页', Analysis: '分析', Profile: '我的' };

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: T.ink,
        tabBarInactiveTintColor: T.faint,
        tabBarStyle: { backgroundColor: T.surface, borderTopColor: T.hair, height: 84, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
        tabBarIcon: ({ color }) => <Icon name={TAB_ICON[route.name]} size={24} color={color} sw={1.9} />,
        tabBarLabel: TAB_LABEL[route.name],
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="AA" component={AAScreen} options={{ presentation: 'card' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
