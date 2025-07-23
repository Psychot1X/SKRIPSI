import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './android/app/src/context/ThemeSwitch';

import SplashScreen from './android/app/src/screens/SplashScreen';
import LoginAsAdmin from './android/app/src/screens/LoginAsAdmin';
import RegisterScreen from './android/app/src/screens/RegisterScreen';
import { LoginScreen } from './android/app/src/screens/LoginScreen';
import HomeScreen from './android/app/src/screens/HomeScreen';
import { AddExpenseScreen } from './android/app/src/screens/AddExpenseScreen';
import PredictionScreen from './android/app/src/screens/PredictionScreen';
import AdminUserList from './android/app/src/screens/AdminUserList';
import EditNewProfile from './android/app/src/screens/EditNewProfile';
import BottomTabNavigator from './android/app/src/screens/BottomTabNavigator';
import OtpScreen from './android/app/src/screens/OtpScreen';

enableScreens();
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OtpScreen" component={OtpScreen} />
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="EditProfile" component={EditNewProfile} />
          <Stack.Screen name="LoginAsAdmin" component={LoginAsAdmin} />
          <Stack.Screen name="Admin" component={AdminUserList} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
