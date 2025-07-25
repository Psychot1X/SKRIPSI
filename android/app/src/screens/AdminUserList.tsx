import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Switch,
  TouchableOpacity
} from 'react-native';
import { getAllUsers } from '../firebase/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  job: string;
}

export default function AdminUserList({ navigation }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    getAllUsers()
      .then((userList: User[]) => setUsers(userList))
      .catch((err: any) => console.log('Error:', err));
  }, []);

  const styles = getStyles(isDarkMode);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daftar User</Text>
        <View style={styles.switchRow}>
          <Text style={[styles.label, { marginRight: 10 }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.detail}>{item.email}</Text>
            <Text style={styles.detail}>{item.phone}</Text>
            <Text style={styles.detail}>{item.job}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDark ? '#121212' : '#fff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: 'Poppins',
      color: isDark ? '#fff' : '#000',
    },
    label: {
      fontSize: 14,
      fontFamily: 'Poppins',
      color: isDark ? '#fff' : '#000',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userCard: {
      backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    },
    name: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
    },
    detail: {
      fontSize: 14,
      color: isDark ? '#ccc' : '#555',
    },
    logoutButton: {
      marginTop: 20,
      backgroundColor: '#e11d48',
      paddingVertical: 12,
      borderRadius: 10,
    },
    logoutText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'Poppins',
    },
  });
