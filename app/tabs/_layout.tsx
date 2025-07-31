import { Tabs } from "expo-router";
import React from "react";
import { Home, BarChart2, Settings } from "lucide-react-native";
import Colors from "@/constants/colors";
import { StatusBar } from "expo-status-bar";

export default function TabLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textLight,
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.background,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
          },
          headerTitleStyle: {
            color: Colors.text,
            fontWeight: "700",
            fontSize: 18,
          },
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            height: 88,
            paddingBottom: 24,
            paddingTop: 12,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Monitor",
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
            headerTitle: "CrateQuiet",
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
            headerTitle: "Progress Dashboard",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
            headerTitle: "Settings",
          }}
        />
      </Tabs>
    </>
  );
}