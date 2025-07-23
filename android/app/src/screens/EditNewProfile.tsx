// ✅ Full EditNewProfile.tsx versi Native Firebase (auth + firestore)
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Image, Alert, ScrollView, Modal, Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import defaultProfile from '../icon/profile.png';
import { firebaseAuth, db } from '../firebase/firebase';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../context/ThemeSwitch';

export default function EditNewProfile({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    const options = { mediaType: 'photo' as const, maxWidth: 300, maxHeight: 300 };
    launchImageLibrary(options, async (response) => {
      if (response.didCancel || response.errorCode) return;
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
      const userRef = firestore().collection('users').doc(userId);
      await userRef.update({ name, email });
    }

    alert('Profil disimpan');
    navigation.navigate('Main'); // <-- ini! (karena Main = BottomTabNavigator = Home)
  } catch (err) {
    console.log('Save error:', err);
    Alert.alert('Error', 'Gagal menyimpan profil');
  }
};

  const handleChangePassword = async () => {
    console.log('gajalan anjir');
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Password baru tidak cocok');
      return;
    }

    const user = auth().currentUser;
    if (!user || !user.email) {
      Alert.alert('Error', 'User tidak ditemukan');
      return;
    }

    const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);
    try {
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);
      Alert.alert('Sukses', 'Password berhasil diubah');
      setModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal mengganti password');
    }
  };

  const signOut = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>      
      
      <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
      marginTop: 12,
      width: '100%',
    }}>
      <TouchableOpacity onPress={() => navigation.navigate('Main')} style={{ padding: 6, marginRight: 10 }}>
        <Text style={{ fontSize: 50, color: isDarkMode ? '#fff' : '#222' }}>{'‹'}</Text>
      </TouchableOpacity>
    </View>
      
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Image source={photo ? { uri: photo } : defaultProfile} style={styles.avatar} />
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

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.saveButton, { backgroundColor: '#6b7280' }]}
      >
        <Text style={styles.saveButtonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.saveButtonText}>Simpan</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

       

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: isDarkMode ? '#1c1c1e' : '#fff', padding: 20, borderRadius: 10, width: '90%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10, color: isDarkMode ? '#fff' : '#000' }}>
              Update your password
            </Text>
            <TextInput secureTextEntry placeholder="Current Password" placeholderTextColor="#888" style={[styles.input, { marginBottom: 10 }]} onChangeText={setCurrentPassword} value={currentPassword} />
            <TextInput secureTextEntry placeholder="New Password" placeholderTextColor="#888" style={[styles.input, { marginBottom: 10 }]} onChangeText={setNewPassword} value={newPassword} />
            <TextInput secureTextEntry placeholder="Confirm New Password" placeholderTextColor="#888" style={[styles.input, { marginBottom: 10 }]} onChangeText={setConfirmPassword} value={confirmPassword} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#888', marginRight: 15 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleChangePassword}>
                <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
    backgroundColor: '#f1f5f9'
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
