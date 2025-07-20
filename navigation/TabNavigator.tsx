import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Layout } from '../constants';
import {
  MonitoringScreen,
  ProgressScreen,
  SettingsScreen,
} from '../screens';
import { HowToScreen } from '../screens/HowToScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Monitor':
              iconName = focused ? 'radio' : 'radio-outline';
              break;
            case 'Progress':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.surfaceLight,
          borderTopWidth: 1,
          paddingBottom: 2, // Further reduced for tighter fit
          paddingTop: 4,
          height: 48, // Further reduced for tighter fit
        },
        tabBarLabelStyle: {
          fontSize: Layout.fontSize.sm,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.background,
          borderBottomColor: Colors.surfaceLight,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: Layout.fontSize.lg,
        },
        headerShown: false, // We'll handle headers in individual screens
      })}
    >
      <Tab.Screen 
        name="Monitor" 
        component={MonitoringScreen}
        options={{ tabBarLabel: 'Monitor' }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ tabBarLabel: 'Progress' }}
      />
      <Tab.Screen 
        name="HowTo" 
        component={HowToScreen}
        options={{ tabBarLabel: 'How-To' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};
