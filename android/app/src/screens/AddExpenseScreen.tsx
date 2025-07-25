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
  Dimensions,
  Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { addExpense } from '../firebase/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeSwitch';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  { key: 'Biaya-Biaya',      icon: 'receipt-outline', color: '#C2410C', desc: 'Admin, Pajak' },
];

export function AddExpenseScreen({ navigation }: any) {
  const { isDarkMode } = useTheme();

  // State tanggal
  const [date, setDate] = useState<Date>(new Date());
  const [dateString, setDateString] = useState(
    new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  );
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // State lainnya
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

  // ==== FIX UTAMA: PASTIKAN YANG DI-SAVE ADALAH TANGGAL YANG DIPILIH USER ====
  const handleAdd = async () => {
  if (!userId) {
    Alert.alert('Gagal', 'User belum login, silakan login ulang');
    return;
  }
  if (!amount || !category) {
    Alert.alert('Gagal', 'Nominal & kategori wajib diisi');
    return;
  }
  try {
    await addExpense(userId, {
      amount: parseAmount(amount),
      description,
      category,
      createdAt: date.toISOString(), // ✅ tanggal input user
      userId
    });
    Alert.alert('Berhasil', 'Pengeluaran berhasil ditambahkan');
    navigation.navigate('Home');
  } catch (err) {
    console.log('Gagal tambah expense:', err);
    Alert.alert('Error', 'Gagal menyimpan data');
  }
};


  const styles = getStyles(isDarkMode);

  return (
    <View style={[styles.bg]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tambah Pengeluaran</Text>

        <Text style={styles.label}>Tanggal</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerVisible(true)}>
          <Text style={styles.dateText}>{dateString}</Text>
          <Ionicons name="calendar-outline" size={20} color={isDarkMode ? '#fff' : '#374151'} />
        </TouchableOpacity>
        {/* DatePicker */}
        {datePickerVisible && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setDatePickerVisible(false);
              if (selectedDate) {
                setDate(selectedDate); // WAJIB: update state date sesuai pilihan user!
                setDateString(selectedDate.toLocaleDateString('id-ID', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                }));
              }
            }}
            maximumDate={new Date()}
          />
        )}

        <Text style={styles.label}>Nominal (Rp)</Text>
        <TextInput
          placeholder="Contoh: 100.000"
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
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
          <Text style={[styles.dateText, !category && { color: isDarkMode ? '#888' : '#9CA3AF' }]}>
            {category || 'Pilih Kategori'}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color={isDarkMode ? '#fff' : '#374151'} />
        </TouchableOpacity>

        <Text style={styles.label}>Catatan</Text>
        <TextInput
          placeholder="Opsional"
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleAdd} disabled={!userId}>
          <Text style={styles.buttonText}>Tambah</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={catModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#23262f' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#222' }]}>Pilih Kategori</Text>
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
                  <Text style={[styles.catLabel, { color: isDarkMode ? '#fff' : '#222' }]}>{c.key}</Text>
                  <Text style={[styles.catDesc, { color: isDarkMode ? '#aaa' : '#6B7280' }]}>{c.desc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setCatModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: isDarkMode ? '#fff' : '#374151' }]}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  bg: { flex: 1, backgroundColor: isDarkMode ? '#18181b' : '#fff' },
  container: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: isDarkMode ? '#fff' : '#18181b' },
  label: { fontWeight: '600', marginBottom: 6, color: isDarkMode ? '#fff' : '#18181b' },
  input: {
    borderWidth: 1,
    borderColor: isDarkMode ? '#333' : '#ccc',
    backgroundColor: isDarkMode ? '#22223b' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
    padding: 12, borderRadius: 8,
    marginBottom: 16, fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1, borderColor: isDarkMode ? '#333' : '#ccc',
    backgroundColor: isDarkMode ? '#22223b' : '#f9fafb',
    padding: 12, borderRadius: 8,
    marginBottom: 16,
  },
  dateText: { fontSize: 16, color: isDarkMode ? '#fff' : '#111' },

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
    fontWeight: '600',
  },
});
