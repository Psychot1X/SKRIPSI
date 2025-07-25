import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function LoginAsAdmin({ navigation }: any) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');

const handleLogin = () => {
  if (adminId === 'admin123' && password === 'adminpass') {
    navigation.replace('Admin'); // GANTI INI
  } else {
    Alert.alert('Login Gagal', 'ID atau Password Admin salah');
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Admin</Text>
      <TextInput
        style={styles.input}
        placeholder="Admin ID"
        value={adminId}
        onChangeText={setAdminId}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Poppins',
  },
  button: {
    backgroundColor: '#1d60e6',
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
});