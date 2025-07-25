import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Image,
  ActivityIndicator
} from 'react-native';
import { signInUser } from '../firebase/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false); // ⬅️ Tambahan

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Input Kosong', 'Email dan password tidak boleh kosong.');
      return;
    }

    // Cek admin dummy login
    if (isAdminMode) {
      if (email === 'admin123' && password === 'adminpass') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Admin' }],
        });
      } else {
        Alert.alert('Login Gagal', 'ID atau Password Admin salah.');
      }
      return;
    }

    // Normal Firebase login
    setIsLoading(true);
    try {
      const userCredential = await signInUser(email, password);
      await AsyncStorage.setItem('userId', userCredential.user.uid);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error: any) {
      let errorMessage = 'Email atau password salah.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email atau password yang Anda masukkan salah.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.';
      }
      Alert.alert('Login Gagal', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>Login</Text>
        <View style={styles.switchRow}>
          <Text style={{ color: isDarkMode ? '#fff' : '#000', marginRight: 10 }}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.switchRow}>
        <Text style={{ color: isDarkMode ? '#fff' : '#000', marginRight: 10 }}>Login Admin</Text>
        <Switch
          value={isAdminMode}
          onValueChange={setIsAdminMode}
          trackColor={{ false: '#767577', true: '#fbbf24' }}
          thumbColor={isAdminMode ? '#fff' : '#f4f3f4'}
        />
      </View>

      <TextInput
        placeholder={isAdminMode ? 'Admin ID' : 'Email'}
        placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
        style={[
          styles.input,
          {
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f1f5f9',
            color: isDarkMode ? '#fff' : '#000',
            borderColor: isDarkMode ? '#333' : '#e2e8f0'
          }
        ]}
        keyboardType={isAdminMode ? 'default' : 'email-address'}
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
      />

      <View
        style={[
          styles.input,
          {
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f1f5f9',
            borderColor: isDarkMode ? '#333' : '#e2e8f0',
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 0
          }
        ]}
      >
        <TextInput
          placeholder="Password"
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          style={{
            flex: 1,
            color: isDarkMode ? '#fff' : '#000',
            fontSize: 16,
            paddingVertical: 14
          }}
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
          value={password}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={
              showPassword
                ? require('../icon/hide.png')
                : require('../icon/show.png')
            }
            style={{ width: 20, height: 20, tintColor: isDarkMode ? '#ccc' : '#666' }}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log in</Text>
        )}
      </TouchableOpacity>

      {!isAdminMode && (
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.link, { color: isDarkMode ? '#90cdf4' : '#2563eb' }]}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold'
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '500'
  }
});
