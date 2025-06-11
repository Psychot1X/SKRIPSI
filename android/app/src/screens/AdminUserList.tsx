import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getAllUsers } from '../firebase/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  job: string;
}

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getAllUsers()
  .then((userList: User[]) => setUsers(userList))
  .catch((err: any) => console.log('Error:', err));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar User</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Poppins',
  },
  userCard: {
    backgroundColor: '#f3f3f3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 14,
    color: '#555',
  },
});