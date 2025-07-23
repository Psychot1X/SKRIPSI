import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const logoWidth = 238;
const logoHeight = 109;

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const checkLogin = async () => {
      const userId = await AsyncStorage.getItem('userId');
      setTimeout(() => {
        if (userId) {
          navigation.replace('Main');
        } else {
          navigation.replace('Register');
        }
      }, 3000);
    };
    checkLogin();
  }, [navigation]);

  return (
    <View style={styles.bg}>
      <Image
        source={require('../icon/logofinzi.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>
        <Text style={{ fontStyle: 'italic' }}>Finance? Always Eazi</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: logoWidth,
    height: logoHeight,
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: '#111',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
});
