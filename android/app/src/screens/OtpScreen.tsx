import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { registerUser } from '../firebase/firebase';

export default function OtpScreen({ route, navigation }: any) {
  const { otp, email, formData } = route.params;
  const [inputOtp, setInputOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const verifyOtp = async () => {
    if (inputOtp !== String(otp)) {
      Alert.alert('OTP Salah', 'Kode OTP yang kamu masukkan salah. Coba lagi.');
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(formData);

      Alert.alert('Sukses!', 'Akun Anda berhasil dibuat.');
      navigation.navigate('Login');

    } catch (error: any) {
      console.error('❌ Gagal saat registrasi:', error);
      let errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Alamat email ini sudah terdaftar.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah. Harap gunakan minimal 6 karakter.';
      }
      
      Alert.alert('Registrasi Gagal', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifikasi OTP</Text>
      <Text style={styles.subtitle}>
        Masukkan 6 digit kode yang dikirim ke email {email}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Masukkan OTP"
        keyboardType="numeric"
        maxLength={6}
        value={inputOtp}
        onChangeText={setInputOtp}
      />
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={verifyOtp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verifikasi & Daftar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1d60e6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#a5c3f2'
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
