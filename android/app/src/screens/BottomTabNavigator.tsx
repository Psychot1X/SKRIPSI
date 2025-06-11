import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from './HomeScreen';
import {AddExpenseScreen} from './AddExpenseScreen';
import {PredictionScreen} from './PredictionScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';

          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Add') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Predict') iconName = focused ? 'bar-chart' : 'bar-chart-outline';

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: '#E0F2FE',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Add" component={AddExpenseScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Predict" component={PredictionScreen} />
    </Tab.Navigator>
  );
}