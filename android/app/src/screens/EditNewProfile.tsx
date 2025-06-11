// ✅ EditNewProfile.tsx (Versi Firebase + AsyncStorage)
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Image, Alert, Switch, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import defaultProfile from '../icon/profile.png';
import { useTheme } from '../context/ThemeSwitch';
import { db } from '../firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function EditNewProfile({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const loadProfile = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedPhoto = await AsyncStorage.getItem('userProfile');
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedPhoto) setPhoto(storedPhoto);
    };
    loadProfile();
  }, []);

  const pickImage = async () => {
    const options = {
      mediaType: 'photo' as const,
      maxWidth: 300,
      maxHeight: 300,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Image Picker Error', response.errorMessage || 'Unknown error');
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setPhoto(uri);
        await AsyncStorage.setItem('userProfile', uri);
      }
    });
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userEmail', email);

      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          name,
          email,
        });
      }

      alert('Profil disimpan');
    } catch (err) {
      console.log('Save error:', err);
      Alert.alert('Error', 'Gagal menyimpan profil');
    }
  };

  const signOut = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Image
          source={photo ? { uri: photo } : defaultProfile}
          style={styles.avatar}
        />
        <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>Tap to change photo</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f1f5f9', color: isDarkMode ? '#fff' : '#000' }]}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
      />

      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f1f5f9', color: isDarkMode ? '#fff' : '#000' }]}
        value={email}
        onChangeText={setEmail}
        placeholder="Your email"
        placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
        keyboardType="email-address"
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, alignSelf: 'flex-start' }}>
        <Text style={{ color: isDarkMode ? '#fff' : '#000', marginRight: 10 }}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.saveButtonText}>Simpan</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    flexGrow: 1
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 20
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontWeight: '600',
    fontSize: 14
  },
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  signOutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
