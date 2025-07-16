// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { addExpense } from '../firebase/firebase';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export function AddExpenseScreen({ navigation }: any) {
//   const [type, setType] = useState('');
//   const [amount, setAmount] = useState('');
//   const [description, setDescription] = useState('');
//   const [category, setCategory] = useState('');
//   const [userId, setUserId] = useState('');

//   useEffect(() => {
//     AsyncStorage.getItem('userId').then((id) => {
//       if (id) setUserId(id);
//     });
//   }, []);

//   const parseAmount = (value: string) => {
//     const clean = value.replace(/\./g, '');
//     return isNaN(Number(clean)) ? 0 : Number(clean);
//   };

//   const handleAddExpense = async () => {
//     if (!type || !amount || !category) {
//       Alert.alert('Gagal', 'Semua field wajib diisi');
//       return;
//     }

//     const numericAmount = parseAmount(amount);

//     try {
//       await addExpense(userId, {
//         type,
//         amount: numericAmount,
//         description,
//         category,
//         createdAt: new Date().toISOString(),
//       });

//       Alert.alert('Berhasil', 'Pengeluaran berhasil ditambahkan');
//       navigation.navigate('Home');
//     } catch (err) {
//       Alert.alert('Error', 'Gagal menyimpan data');
//       console.error(err);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Tambah Pengeluaran</Text>

//       <Text style={styles.label}>Jenis Transaksi</Text>
//       <TextInput
//         placeholder="Misal: Belanja, Makan"
//         value={type}
//         onChangeText={setType}
//         style={styles.input}
//       />

//       <Text style={styles.label}>Nominal (Rp)</Text>
//       <TextInput
//         placeholder="Contoh: 100.000"
//         value={amount}
//         onChangeText={(text) => {
//           const clean = text.replace(/[^0-9]/g, '');
//           let formatted = '';
//           let count = 0;
//           for (let i = clean.length - 1; i >= 0; i--) {
//             formatted = clean[i] + formatted;
//             count++;
//             if (count % 3 === 0 && i !== 0) {
//               formatted = '.' + formatted;
//             }
//           }
//           setAmount(formatted);
//         }}
//         keyboardType="numeric"
//         style={styles.input}
//       />

//       <Text style={styles.label}>Kategori</Text>
//       <View style={styles.pickerContainer}>
//         <Picker
//           selectedValue={category}
//           onValueChange={(itemValue) => setCategory(itemValue)}
//           style={{ color: '#000' }}
//         >
//           <Picker.Item label="Pilih Kategori" value="" />
//           <Picker.Item label="Makanan" value="Makanan" />
//           <Picker.Item label="Transportasi" value="Transportasi" />
//           <Picker.Item label="Hiburan" value="Hiburan" />
//           <Picker.Item label="Tagihan" value="Tagihan" />
//           <Picker.Item label="Lainnya" value="Lainnya" />
//         </Picker>
//       </View>

//       <Text style={styles.label}>Catatan</Text>
//       <TextInput
//         placeholder="Opsional"
//         value={description}
//         onChangeText={setDescription}
//         style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
//         multiline
//       />

//       <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
//         <Text style={styles.buttonText}>Tambah</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, flexGrow: 1 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   label: { fontWeight: '600', marginBottom: 5 },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 15,
//     fontSize: 16,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     marginBottom: 15,
//     overflow: 'hidden',
//   },
//   button: {
//     backgroundColor: '#1D4ED8',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
// });

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { addExpense } from '../firebase/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const CATEGORIES = [
  { key: 'Makanan & Minuman', icon: 'restaurant-outline', color: '#F97316', desc: 'Restoran, Kafe, Jajan' },
  { key: 'Groceries',        icon: 'basket-outline',    color: '#10B981', desc: 'Bahan Makanan, Rumah' },
  { key: 'Shopping',         icon: 'bag-outline',       color: '#EC4899', desc: 'Pakaian, Elektronik' },
  { key: 'Top Up E-Money',   icon: 'card-outline',      color: '#3B82F6', desc: 'GoPay, OVO, DANA...' },
  { key: 'Transportasi',     icon: 'car-outline',       color: '#A16207', desc: 'Bensin, Parkir, Tol...' },
  { key: 'Hiburan',          icon: 'musical-notes-outline', color: '#8B5CF6', desc: 'Hobi, Streaming' },
  { key: 'Liburan',          icon: 'airplane-outline',  color: '#D946EF', desc: 'Tiket, Penginapan' },
  { key: 'Tagihan',          icon: 'receipt-outline',    color: '#7C3AED', desc: 'Listrik, Internet...' },
  { key: 'Kesehatan',        icon: 'heart-outline',      color: '#EF4444', desc: 'Dokter, Obat' },
  { key: 'Sosial',           icon: 'people-outline',     color: '#22D3EE', desc: 'Donasi, Hadiah' },
  { key: 'Asuransi',         icon: 'shield-outline',     color: '#047857', desc: 'Kesehatan, Jiwa...' },
  { key: 'Investasi',        icon: 'trending-up-outline',color: '#2563EB', desc: 'Saham, Reksadana' },
  { key: 'Edukasi',          icon: 'book-outline',       color: '#06B6D4', desc: 'Sekolah, Kursus' },
  { key: 'Keluarga',         icon: 'home-outline',       color: '#DC2626', desc: 'Anak, Orang Tua' },
  { key: 'Pinjaman',         icon: 'cash-outline',       color: '#9333EA', desc: 'Cicilan, Kartu Kredit' },
  { key: 'Biaya-Biaya',      icon: 'receipt-cutoff-outline', color: '#C2410C', desc: 'Admin, Pajak' },
];

export function AddExpenseScreen({ navigation }: any) {
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [userId, setUserId] = useState('');
  const [catModal, setCatModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => id && setUserId(id));
  }, []);

  const parseAmount = (v: string) => {
    const clean = v.replace(/\./g, '');
    return isNaN(Number(clean)) ? 0 : Number(clean);
  };

  const handleAdd = async () => {
    if (!date || !amount || !category) {
      Alert.alert('Gagal', 'Semua field wajib diisi');
      return;
    }
    try {
      await addExpense(userId, {
        amount: parseAmount(amount),
        description,
        category,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Berhasil', 'Pengeluaran berhasil ditambahkan');
      navigation.navigate('Home');
    } catch {
      Alert.alert('Error', 'Gagal menyimpan data');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tambah Pengeluaran</Text>

        <Text style={styles.label}>Tanggal</Text>
        <TouchableOpacity style={styles.dateButton}>
          <Text style={styles.dateText}>{date}</Text>
          <Ionicons name="calendar-outline" size={20} color="#374151" />
        </TouchableOpacity>

        <Text style={styles.label}>Nominal (Rp)</Text>
        <TextInput
          placeholder="Contoh: 100.000"
          value={amount}
          onChangeText={t => {
            const clean = t.replace(/[^0-9]/g, '');
            let f = '', c = 0;
            for (let i = clean.length - 1; i >= 0; i--) {
              f = clean[i] + f; c++;
              if (c % 3 === 0 && i !== 0) f = '.' + f;
            }
            setAmount(f);
          }}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Kategori</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setCatModal(true)}
        >
          <Text style={[styles.dateText, !category && { color: '#9CA3AF' }]}>
            {category || 'Pilih Kategori'}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color="#374151" />
        </TouchableOpacity>

        <Text style={styles.label}>Catatan</Text>
        <TextInput
          placeholder="Opsional"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Tambah</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={catModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Kategori</Text>
            <ScrollView contentContainerStyle={styles.modalGrid}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c.key}
                  style={styles.catItem}
                  onPress={() => {
                    setCategory(c.key);
                    setCatModal(false);
                  }}
                >
                  <View style={[styles.catIconContainer, { backgroundColor: c.color + '33' }]}>
                    <Ionicons name={c.icon} size={24} color={c.color} />
                  </View>
                  <Text style={styles.catLabel}>{c.key}</Text>
                  <Text style={styles.catDesc}>{c.desc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setCatModal(false)}
            >
              <Text style={styles.modalCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ccc',
    padding: 12, borderRadius: 8,
    marginBottom: 16, fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#ccc',
    padding: 12, borderRadius: 8,
    marginBottom: 16,
  },
  dateText: { fontSize: 16, color: '#111' },

  button: {
    backgroundColor: '#1D4ED8',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  catItem: {
    width: (screenWidth - 64) / 2,
    marginVertical: 8,
    alignItems: 'center',
  },
  catIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  catLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  catDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  modalClose: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    margin: 16,
  },
  modalCloseText: {
    textAlign: 'center',
    color: '#374151',
    fontWeight: '600',
  },
});

