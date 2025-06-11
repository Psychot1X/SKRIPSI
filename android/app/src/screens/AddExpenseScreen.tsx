import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addExpense } from '../firebase/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function AddExpenseScreen({ navigation }: any) {
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('userId').then((id) => {
      if (id) setUserId(id);
    });
  }, []);

  const parseAmount = (value: string) => {
    const clean = value.replace(/\./g, '');
    return isNaN(Number(clean)) ? 0 : Number(clean);
  };

  const handleAddExpense = async () => {
    if (!type || !amount || !category) {
      Alert.alert('Gagal', 'Semua field wajib diisi');
      return;
    }

    const numericAmount = parseAmount(amount);

    try {
      await addExpense(userId, {
        type,
        amount: numericAmount,
        description,
        category,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Berhasil', 'Pengeluaran berhasil ditambahkan');
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Error', 'Gagal menyimpan data');
      console.error(err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tambah Pengeluaran</Text>

      <Text style={styles.label}>Jenis Transaksi</Text>
      <TextInput
        placeholder="Misal: Belanja, Makan"
        value={type}
        onChangeText={setType}
        style={styles.input}
      />

      <Text style={styles.label}>Nominal (Rp)</Text>
      <TextInput
        placeholder="Contoh: 100.000"
        value={amount}
        onChangeText={(text) => {
          const clean = text.replace(/[^0-9]/g, '');
          let formatted = '';
          let count = 0;
          for (let i = clean.length - 1; i >= 0; i--) {
            formatted = clean[i] + formatted;
            count++;
            if (count % 3 === 0 && i !== 0) {
              formatted = '.' + formatted;
            }
          }
          setAmount(formatted);
        }}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Kategori</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={{ color: '#000' }}
        >
          <Picker.Item label="Pilih Kategori" value="" />
          <Picker.Item label="Makanan" value="Makanan" />
          <Picker.Item label="Transportasi" value="Transportasi" />
          <Picker.Item label="Hiburan" value="Hiburan" />
          <Picker.Item label="Tagihan" value="Tagihan" />
          <Picker.Item label="Lainnya" value="Lainnya" />
        </Picker>
      </View>

      <Text style={styles.label}>Catatan</Text>
      <TextInput
        placeholder="Opsional"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
        <Text style={styles.buttonText}>Tambah</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#1D4ED8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
