import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, ScrollView, Alert,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { getExpensesByUserId } from '../firebase/firebase';
import { useTheme } from '../context/ThemeSwitch';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';

type Expense = {
  id: string;
  category: string;
  amount: number;
  createdAt: string;
};

type BarItem = {
  value: number;
  label: string;
  frontColor: string;
  date: string;
};

const screenWidth = Dimensions.get('window').width;

// const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

const getDayName = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export default function PredictionScreen() {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);

  const [tab, setTab] = useState<'Prediction' | 'Analysis'>('Prediction');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const isFocused = useIsFocused();

  // Pie chart color set
  const fixedColors = [
    '#2978FA', '#36BFFA', '#F79009', '#12B76A', '#F04438', '#A259FF', '#F4D8B0',
  ];

  useEffect(() => {
    if (isFocused) {
      (async () => {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return setExpenses([]);
        const data = await getExpensesByUserId(userId);
        const mapped: Expense[] = Array.isArray(data)
          ? data.filter(e => !!e && e.id)
              .map((e: any) => ({
                id: e.id,
                category: e.category || 'Tanpa Kategori',
                amount: typeof e.amount === 'number' ? e.amount : 0,
                createdAt: typeof e.createdAt === 'string'
                  ? e.createdAt
                  : (e.createdAt?.toDate ? e.createdAt.toDate().toISOString() : ''),
              }))
              .filter(e => e.id && e.createdAt)
          : [];
        setExpenses(mapped);
      })();
    }
  }, [isFocused]);

  // Bar Chart: Grouping 7 days
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 6);

  const dailyExpenseMap: { [day: string]: number } = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(oneWeekAgo);
    d.setDate(d.getDate() + i);
    const dayKey = d.toISOString().slice(0, 10);
    dailyExpenseMap[dayKey] = 0;
  }

  expenses.forEach(e => {
    const dateKey = e.createdAt?.slice(0, 10);
    if (dailyExpenseMap[dateKey] !== undefined) {
      dailyExpenseMap[dateKey] += e.amount || 0;
    }
  });

  const barData: BarItem[] = Object.entries(dailyExpenseMap).map(([date, value]) => ({
    value,
    label: getDayName(date),
    frontColor: '#2978FA',
    date,
  }));

  const avgExpense = barData.reduce((sum, item) => sum + item.value, 0) / barData.length;

  const maxBar = Math.max(...barData.map(b => b.value), 1);

  // Pie Chart Data
  const typeStats = expenses.reduce((acc, e) => {
    if (!e.category) return acc;
    if (!acc[e.category]) {
      acc[e.category] = {
        value: 0,
        count: 0,
        color: fixedColors[Object.keys(acc).length % fixedColors.length],
      };
    }
    acc[e.category].value += e.amount || 0;
    acc[e.category].count += 1;
    return acc;
  }, {} as Record<string, { value: number, count: number, color: string }>);

  const totalExpense = Object.values(typeStats).reduce((sum, e) => sum + e.value, 0);

  const pieData = Object.entries(typeStats).map(([category, stat]) => ({
    value: stat.value,
    color: stat.color,
    text: category,
  }));

  // ==== FUNGSI HANDLE DOWNLOAD PDF, SHARE & OPEN ====
  const handleDownloadReport = async () => {
    try {
      // Data rows for the table
      const expenseRows = expenses
        .map(e => `
          <tr>
            <td style="padding:4px 8px;">${e.category}</td>
            <td style="padding:4px 8px;">${e.createdAt?.slice(0, 10)}</td>
            <td style="padding:4px 8px; color: #d32f2f;">-Rp${e.amount.toLocaleString('id-ID')}</td>
          </tr>
        `).join('');

      // HTML Template
      const htmlContent = `
        <h2>Laporan Pengeluaran 7 Hari Terakhir</h2>
        <table border="1" style="width:100%; border-collapse: collapse; margin-bottom:12px; font-size: 14px;">
          <tr style="background:#f2f2f2;">
            <th>Kategori</th>
            <th>Tanggal</th>
            <th>Jumlah</th>
          </tr>
          ${expenseRows}
        </table>
        <p><b>Total: Rp${barData.reduce((a, b) => a + b.value, 0).toLocaleString('id-ID')}</b></p>
      `;

      const fileName = 'Laporan_Expense_7_Hari.pdf';
      const options = {
        html: htmlContent,
        fileName: fileName.replace('.pdf', ''),
        directory: 'Download',
      };

      // 1. Generate PDF (sandbox path)
      const file = await RNHTMLtoPDF.convert(options);

      // 2. Public Download path
      const publicDownloadDir = RNFS.DownloadDirectoryPath; // '/storage/emulated/0/Download'
      const destPath = `${publicDownloadDir}/${fileName}`;

      // 3. Copy ke Download publik (replace jika sudah ada)
      await RNFS.copyFile(file.filePath, destPath);

      Alert.alert(
        'Sukses',
        `Laporan berhasil dibuat di folder Download:\n${destPath}`,
        [
          {
            text: 'Share',
            onPress: async () => {
              try {
                await Share.open({
                  url: `file://${destPath}`,
                  type: 'application/pdf',
                  title: 'Bagikan Laporan PDF'
                });
              } catch (err) {}
            }
          },
          {
            text: 'Open',
            onPress: async () => {
              try {
                await FileViewer.open(destPath);
              } catch (err) {
                Alert.alert('Gagal membuka file PDF');
              }
            }
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } catch (err) {
      Alert.alert('Gagal', 'Gagal membuat report PDF');
    }
  };
  // ==== END FUNGSI ====

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

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showPredictionDetail, setShowPredictionDetail] = useState(false);
  return (
    <View style={styles.container}>
      {/* Segmented Tab */}
      <View style={styles.segmented}>
        <TouchableOpacity
          style={[styles.segmentBtn, tab === 'Prediction' && styles.segmentBtnActive]}
          onPress={() => setTab('Prediction')}
        >
          <Text style={[styles.segmentText, tab === 'Prediction' && styles.segmentTextActive]}>
            Prediction
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, tab === 'Analysis' && styles.segmentBtnActive]}
          onPress={() => setTab('Analysis')}
        >
          <Text style={[styles.segmentText, tab === 'Analysis' && styles.segmentTextActive]}>
            Analysis
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'Prediction' ? (
        <>
          <Text style={styles.sectionTitle}>Next Month Prediction</Text>
          <TouchableOpacity
  onPress={() => setShowPredictionDetail(prev => !prev)}
  style={{ alignSelf: 'flex-end', marginRight: 16, marginBottom: 6 }}
>
  <Text style={{ color: '#2563eb', fontWeight: '600' }}>
    {showPredictionDetail ? 'Sembunyikan Detail' : 'Tampilkan Detail'}
  </Text>
</TouchableOpacity>
          <View style={styles.predictionCard}>
            <Text style={{ fontWeight: '500', color: '#6B7280', marginBottom: 6 }}>Income & Expenses (Last 7 Days)</Text>
            <BarChart
              data={barData}
              barWidth={20}
              spacing={20}
              hideRules
              yAxisThickness={1}
              yAxisColor="#ddd"
              xAxisColor="#D1D5DB"
              initialSpacing={18}
              noOfSections={4}
              maxValue={maxBar}
              labelWidth={38}
              height={140}
              showVerticalLines
              yAxisTextStyle={{ color: '#888', fontSize: 11 }}
              yAxisLabelTexts={[
                'Rp0',
                `Rp${(maxBar * 0.25).toLocaleString('id-ID')}`,
                `Rp${(maxBar * 0.5).toLocaleString('id-ID')}`,
                `Rp${(maxBar * 0.75).toLocaleString('id-ID')}`,
                `Rp${maxBar.toLocaleString('id-ID')}`
              ]}
              xAxisLabelTextStyle={{ color: '#374151', fontWeight: '500', marginTop: 2 }}
              showXAxisIndices
              yAxisIndicesWidth={2}
              renderTooltip={(item: BarItem) => (
                <View style={{
                  backgroundColor: '#2563eb', padding: 6, borderRadius: 8,
                  shadowColor: '#000', shadowOpacity: 0.13, shadowRadius: 8
                }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                    {item.label} ({item.date.slice(5, 10)}){'\n'}Rp{item.value.toLocaleString('id-ID')}
                  </Text>
                </View>
              )}
            />
            {showPredictionDetail && barData.map((item, idx) => {
  const suggestion = item.value >= avgExpense
    ? `Kurangi pengeluaran, idealnya maksimal Rp${(avgExpense * 0.8).toLocaleString('id-ID')}`
    : `Masih aman, maksimal Rp${(avgExpense * 1.1).toLocaleString('id-ID')}`;

  return (
    <View key={idx} style={{
      marginTop: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: '#d1d5db'
    }}>
      <Text style={{ fontWeight: '600', fontSize: 14, color: '#111' }}>
        {item.label} ({item.date.slice(5)})
      </Text>
      <Text style={{ fontSize: 13, color: '#444' }}>
        Pengeluaran: Rp{item.value.toLocaleString('id-ID')}
      </Text>
      <Text style={{ fontSize: 13, color: item.value >= avgExpense ? '#dc2626' : '#2563eb' }}>
        {suggestion}
      </Text>
    </View>
  );
})}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Total 7 Day Expense</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1976d2' }}>
                  Rp{barData.reduce((a, b) => a + b.value, 0).toLocaleString('id-ID')}
                </Text>
              </View>
              <TouchableOpacity onPress={handleDownloadReport}>
                <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 14 }}>Download Report</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Transaction List */}
          <Text style={styles.sectionTitle}>Transaction</Text>
          <FlatList
            data={expenses}
            keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
            renderItem={renderTrans}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>No transaction</Text>}
          />
        </>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Text style={styles.sectionTitle}>This Month Analysis</Text>
          <View style={styles.analysisCard}>
            <PieChart
              data={pieData}
              donut
              textColor="#fff"
              textSize={13}
              radius={80}
              innerRadius={36}
              
            />
            <View style={styles.pieLegendWrap}>
              {pieData.map((item, idx) => (
                <View key={idx} style={styles.pieLegend}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>

                <View>
                  <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 25, textAlign: 'center' }}>
                    Total{'\n'}Rp{totalExpense.toLocaleString('id-ID')}
                  </Text>
                </View>
              
          {/* Card Analisa per kategori */}
{Object.entries(typeStats).map(([category, stat]) => {
  const isExpanded = expandedCategory === category;
  const categoryExpenses = expenses
    .filter(e => e.category === category)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <View style={styles.transCard} key={category}>
      <TouchableOpacity
        onPress={() => setExpandedCategory(isExpanded ? null : category)}
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <View style={[styles.transIcon, { backgroundColor: stat.color + '22' }]}>
          <Text style={{ fontWeight: 'bold', color: stat.color }}>
            {category[0] || 'T'}
          </Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.transTextWrap}>
            <Text style={styles.transType}>{category}</Text>
            <Text style={styles.transDate}>{stat.count} transaksi</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.transAmount}>
              -Rp{stat.value.toLocaleString('id-ID')}
            </Text>
            <Text style={styles.transPercent}>
              {totalExpense > 0
                ? (stat.value / totalExpense * 100).toFixed(1) + '%'
                : '0%'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
  <View style={{ marginTop: 8, marginLeft: 52, gap: 4 }}>
    {categoryExpenses.map((e, idx) => (
      <View
        key={idx}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 2,
        }}
      >
        <Text style={{ fontSize: 13, color: '#475569' }}>
          {e.createdAt?.slice(0, 10)}
        </Text>
        <Text style={{ fontSize: 13, color: '#475569', fontWeight: '500' }}>
          Rp{e.amount.toLocaleString('id-ID')}
        </Text>
      </View>
    ))}
  </View>
)}
    </View>
  );
})}


        </ScrollView>
      )}
    </View>
  );
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? '#18181B' : '#F4F7FF' },
  segmented: {
    backgroundColor: '#e7ecf5', marginTop: 16, marginHorizontal: 12, borderRadius: 20, flexDirection: 'row',
    padding: 3, alignSelf: 'center', width: screenWidth - 36,
  },
  segmentBtn: {
    flex: 1, borderRadius: 16, paddingVertical: 7, alignItems: 'center', justifyContent: 'center'
  },
  segmentBtnActive: {
    backgroundColor: '#2563eb', shadowColor: '#2563eb', shadowOpacity: 0.07, shadowRadius: 8
  },
  segmentText: { fontWeight: '600', color: '#222', fontSize: 16 },
  segmentTextActive: { color: '#fff' },
  sectionTitle: {
    fontWeight: 'bold', fontSize: 17, marginLeft: 22, marginTop: 18, marginBottom: 6, color: '#212431'
  },
  predictionCard: {
    backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 15, padding: 16, marginTop: 6,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 9,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  analysisCard: {
    backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 14, marginVertical: 8, padding: 18, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 9,
  },
  pieLegendWrap: { flexDirection: 'row', marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' },
  pieLegend: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 6 },
  legendDot: { width: 11, height: 11, borderRadius: 7, marginRight: 5 },
  legendLabel: { color: '#222', fontSize: 13 },
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
  transPercent: { fontSize: 13, color: '#5D6475', textAlign: 'right' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
  listContainer: { paddingBottom: 70 }
});
