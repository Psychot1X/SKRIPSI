import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PieChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { getExpensesByUserId } from '../firebase/firebase';
import { useTheme } from '../context/ThemeSwitch';

type Expense = {
  id: string;
  category: string;
  amount: number;
  createdAt: string;
};

const screenWidth = Dimensions.get('window').width;


export default function HomeScreen({ navigation }: any) {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);

  const isFocused = useIsFocused();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

  const loadData = async () => {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) return setExpenses([]);
  const data = await getExpensesByUserId(userId);

  const mapped: Expense[] = Array.isArray(data)
    ? data
        .filter(e => !!e && e.id)
        .map((e: any) => ({
          id: e.id,
          category: e.category || 'Tanpa Kategori',
          amount: typeof e.amount === 'number' ? e.amount : 0,
          createdAt: typeof e.createdAt === 'string'
            ? e.createdAt
            : (e.createdAt?.toDate ? e.createdAt.toDate().toISOString() : ''),
        }))
        .filter(e => e.id && e.createdAt)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Urutkan terbaru dulu
        .slice(0, 5) // Ambil hanya 5 data
    : [];

  setExpenses(mapped);
};

  // Pie chart
  const typeStats = expenses.reduce((acc, e) => {
    if (!e.category) return acc;
    if (!acc[e.category]) {
      acc[e.category] = {
        value: 0,
        color: ['#2978FA', '#12B76A', '#F79009', '#F04438', '#A259FF'][Object.keys(acc).length % 5],
      };
    }
    acc[e.category].value += e.amount || 0;
    return acc;
  }, {} as Record<string, { value: number, color: string }>);

  const pieData = Object.entries(typeStats).map(([category, s]) => ({
    value: s.value,
    color: s.color,
    text: category,
  }));

  const totalExpense = Object.values(typeStats).reduce((sum, e) => sum + e.value, 0);

  // Transaction card
  const renderTrans = ({ item }: { item: Expense }) => (
    <View style={styles.transCard}>
      <View style={[styles.transIcon, { backgroundColor: (typeStats[item.category]?.color || '#2978FA') + '22' }]}>
        <Text style={{ fontWeight: 'bold', color: typeStats[item.category]?.color || '#2978FA' }}>
          {item.category?.[0] || 'T'}
        </Text>
      </View>
      <View style={styles.transTextWrap}>
        <Text style={styles.transType}>{item.category || 'Tanpa Kategori'}</Text>
        <Text style={styles.transDate}>
          {typeof item.createdAt === 'string' && item.createdAt.length >= 10
            ? item.createdAt.slice(0, 10)
            : ''}
        </Text>
      </View>
      <Text style={styles.transAmount}>
        -Rp{typeof item.amount === 'number' ? item.amount.toLocaleString('id-ID') : '0'}
      </Text>
    </View>
  );
// onPress={() => navigation.navigate('EditProfile')}
  return (
    <View style={styles.container}>
      {/* Avatar ke Profile */}
        <View style={{ alignItems: 'flex-end', paddingRight: 20, marginTop: 10, marginBottom: 10 }}>
    <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
      <Ionicons
      name="person-circle-outline"
      size={36} // ← ukuran diperbesar
      color={isDarkMode ? '#fff' : '#000'}
    />
    </TouchableOpacity>
  </View>


      {/* Card Balance */}
      <View style={styles.balanceCard}>
        <Text style={{ fontSize: 18, color: '#888', fontWeight: '500', marginBottom: 2, marginTop: 8, textAlign: 'center' }}>
          Balance
        </Text>
        <Text style={styles.balanceAmount}>
          Rp{totalExpense.toLocaleString('id-ID')}
        </Text>
        <PieChart
          data={pieData.length > 0 ? pieData : [{ value: 1, color: '#E5E7EB', text: '' }]}
          donut
          showText={false}
          radius={60}
          innerRadius={36}
          centerLabelComponent={() => <View />}
        />
        {/* Legend */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}>
          {pieData.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: item.color, marginRight: 3 }} />
              <Text style={{ fontSize: 12, color: '#222' }}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text
  style={{
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 20, // Tambahkan ini
    color: isDarkMode ? '#CBD5E1' : '#475569',
    alignSelf: 'flex-start', // Supaya gak auto center
  }}
>
  Recent Transactions
</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
        renderItem={renderTrans}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No transaction</Text>}
      />
    </View>
  );
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? '#18181B' : '#F4F7FF', paddingTop: 20 },
  balanceCard: {
    backgroundColor: '#fff', borderRadius: 22, marginHorizontal: 10, padding: 16,
    marginTop: 6, marginBottom: 10, alignItems: 'center', shadowColor: '#000',
    shadowOpacity: 0.04, shadowRadius: 9, elevation: 2,
  },
  balanceAmount: {
    fontSize: 28, fontWeight: 'bold', color: '#232', marginBottom: 2, marginTop: 5, textAlign: 'center',
  },
  sectionTitle: { fontWeight: 'bold', fontSize: 17, marginLeft: 22, marginVertical: 8, color: '#222' },
  transCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 15,
    elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 },
  },
  transIcon: {
    width: 40, height: 40, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 12,
    backgroundColor: '#F3F7FF',
  },
  transTextWrap: { flex: 1 },
  transType: { fontSize: 16, fontWeight: '600', color: '#222' },
  transDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  transAmount: { fontSize: 16, fontWeight: 'bold', color: '#F04438', textAlign: 'right' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
  listContainer: { paddingBottom: 70 }
});
