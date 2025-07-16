// import React, { useEffect, useState } from 'react';
// import {
//   View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet, Dimensions
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import RNFS from 'react-native-fs';
// import XLSX from 'xlsx';
// import Share from 'react-native-share';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
// import { getExpensesByUserId } from '../firebase/firebase';

// const screenWidth = Dimensions.get('window').width;

// export function PredictionScreen() {
//   const [activeTab, setActiveTab] = useState<'Prediction' | 'Analisis'>('Prediction');
//   const [expenses, setExpenses] = useState<any[]>([]);

//   useEffect(() => {
//     const loadData = async () => {
//       const userId = await AsyncStorage.getItem('userId');
//       if (!userId) return;

//       const data = await getExpensesByUserId(userId);
//       setExpenses(data);
//     };

//     loadData();
//   }, []);

//   const linearRegression = (data: number[]): number => {
//     const n = data.length;
//     if (n === 0) return 0;
//     const x = Array.from({ length: n }, (_, i) => i + 1);
//     const sumX = x.reduce((a, b) => a + b, 0);
//     const sumY = data.reduce((a, b) => a + b, 0);
//     const sumXY = data.reduce((acc, y, i) => acc + y * x[i], 0);
//     const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
//     const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
//     const intercept = (sumY - slope * sumX) / n;
//     const prediction = slope * (n + 1) + intercept;
//     return isNaN(prediction) || prediction < 0 ? 0 : prediction;
//   };

//   const getWeekRange = (dateStr: string) => {
//     const day = new Date(dateStr).getDate();
//     if (day <= 7) return '1-7';
//     if (day <= 14) return '8-14';
//     if (day <= 21) return '15-21';
//     return '22-31';
//   };

//   const weeklyTotals: { [week: string]: number[] } = {};
//   expenses.forEach((e) => {
//     const week = getWeekRange(e.createdAt);
//     if (!weeklyTotals[week]) weeklyTotals[week] = [];
//     weeklyTotals[week].push(e.amount);
//   });

//   const labels: string[] = ['1-7', '8-14', '15-21', '22-31'];
//   const weeklySums: number[] = labels.map((week) => {
//     return (weeklyTotals[week] || []).reduce((sum, val) => sum + val, 0);
//   });

//   const predictedTotal = linearRegression(weeklySums);

//   const groupedByCategory: Record<string, number> = expenses.reduce((acc, curr) => {
//     const cat = curr.category || curr.type || 'Lainnya';
//     if (!acc[cat]) acc[cat] = 0;
//     acc[cat] += curr.amount;
//     return acc;
//   }, {} as Record<string, number>);

//   const exportToExcel = async () => {
//     const ws = XLSX.utils.json_to_sheet(expenses);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
//     const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
//     const file = `${RNFS.DownloadDirectoryPath}/prediksi_${Date.now()}.xlsx`;
//     await RNFS.writeFile(file, wbout, 'ascii');
//     await Share.open({ url: 'file://' + file });
//   };

//   const exportToPDF = async () => {
//     const htmlContent = `
//       <h1>Prediksi Bulan Depan</h1>
//       <p>Total: Rp ${predictedTotal.toLocaleString('id-ID')}</p>
//       <h2>Riwayat Transaksi:</h2>
//       <ul>
//         ${expenses.map((e: any) => `<li>${e.type} - Rp ${e.amount.toLocaleString('id-ID')}</li>`).join('')}
//       </ul>
//     `;
//     const options = {
//       html: htmlContent,
//       fileName: `prediksi_${Date.now()}`,
//       directory: 'Documents',
//     };
//     const pdf = await RNHTMLtoPDF.convert(options);
//     await Share.open({ url: 'file://' + pdf.filePath });
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <View style={styles.tabContainer}>
//         {['Prediction', 'Analisis'].map((tab) => (
//           <TouchableOpacity
//             key={tab}
//             style={[styles.tab, activeTab === tab && styles.activeTab]}
//             onPress={() => setActiveTab(tab as any)}
//           >
//             <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <ScrollView contentContainerStyle={styles.container}>
//         {activeTab === 'Prediction' ? (
//           <>
//             <Text style={styles.title}>Prediksi Bulan Depan</Text>
//             <Text style={styles.total}>Rp {predictedTotal.toLocaleString('id-ID')}</Text>
//             <Text style={styles.note}>Berdasarkan histori bulan sebelumnya</Text>
//             {weeklySums.map((sum, index) => (
//               <View key={index} style={{ marginVertical: 4 }}>
//                 <Text>{labels[index]}</Text>
//                 <View style={{ backgroundColor: '#ddd', height: 10, borderRadius: 5 }}>
//                   <View style={{
//                     backgroundColor: '#3B82F6',
//                     width: `${Math.min((sum / Math.max(...weeklySums)) * 100, 100)}%`,
//                     height: 10, borderRadius: 5
//                   }} />
//                 </View>
//                 <Text style={{ fontSize: 12, color: '#888' }}>Rp {sum.toLocaleString('id-ID')}</Text>
//               </View>
//             ))}
//             <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
//               <TouchableOpacity style={[styles.exportButton, { backgroundColor: '#1E3A8A' }]} onPress={exportToPDF}>
//                 <Text style={{ color: '#fff' }}>Export PDF</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.exportButton, { backgroundColor: '#059669' }]} onPress={exportToExcel}>
//                 <Text style={{ color: '#fff' }}>Export Excel</Text>
//               </TouchableOpacity>
//             </View>
//             <Text style={[styles.title, { fontSize: 18, marginTop: 20 }]}>Riwayat Transaksi</Text>
//             <FlatList
//               data={expenses}
//               keyExtractor={(_, index) => index.toString()}
//               scrollEnabled={false}
//               renderItem={({ item }) => (
//                 <View style={styles.transactionItem}>
//                   <Text style={styles.transactionTitle}>📌 {item.type}</Text>
//                   <Text style={styles.transactionAmount}>-Rp {item.amount.toLocaleString('id-ID')}</Text>
//                   <Text style={styles.transactionDate}>{new Date(item.createdAt).toLocaleString('id-ID')}</Text>
//                 </View>
//               )}
//             />
//           </>
//         ) : (
//           <>
//             <Text style={styles.title}>Analisis Pengeluaran</Text>
//             {Object.entries(groupedByCategory).map(([category, value], i) => {
//               const amount = value as number;
//               return (
//                 <View key={i} style={{ marginVertical: 6 }}>
//                   <Text style={{ fontWeight: 'bold' }}>{category}</Text>
//                   <View style={{ backgroundColor: '#ddd', height: 10, borderRadius: 5 }}>
//                     <View style={{
//                       backgroundColor: '#3B82F6',
//                       width: `${Math.min((amount / Math.max(...Object.values(groupedByCategory))) * 100, 100)}%`,
//                       height: 10, borderRadius: 5
//                     }} />
//                   </View>
//                   <Text style={{ fontSize: 12, color: '#888' }}>Rp {amount.toLocaleString('id-ID')}</Text>
//                 </View>
//               );
//             })}
//           </>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
//   total: { fontSize: 32, marginVertical: 10 },
//   note: { marginBottom: 20, fontSize: 12, color: 'gray' },
//   transactionItem: {
//     backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginVertical: 6,
//   },
//   transactionTitle: { fontWeight: 'bold', fontSize: 14 },
//   transactionAmount: { fontSize: 14, color: '#ef4444', marginVertical: 2 },
//   transactionDate: { fontSize: 12, color: 'gray' },
//   tabContainer: {
//     flexDirection: 'row', justifyContent: 'space-around', marginTop: 20,
//     backgroundColor: '#E5E7EB', borderRadius: 10, marginHorizontal: 20,
//   },
//   tab: { paddingVertical: 10, flex: 1, alignItems: 'center', borderRadius: 10 },
//   activeTab: { backgroundColor: '#3B82F6' },
//   tabText: { color: '#374151', fontWeight: '600' },
//   activeTabText: { color: '#FFFFFF' },
//   exportButton: {
//     flex: 1,
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
// });

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import * as XLSX from 'xlsx';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { BarChart } from 'react-native-gifted-charts';
import { getExpensesByUserId } from '../firebase/firebase';

const screenWidth = Dimensions.get('window').width;

export default function PredictionScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'Prediction' | 'Analisis'>('Prediction');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const uid = await AsyncStorage.getItem('userId');
      const pic = await AsyncStorage.getItem('userProfile');
      if (pic) setProfileImage(pic);
      if (uid) {
        const data = await getExpensesByUserId(uid);
        setExpenses(data);
      }
    })();
  }, []);

  // fungsi bantu distribusi minggu
  const getWeekRange = (dateStr: string) => {
    const d = new Date(dateStr).getDate();
    if (d <= 7) return '1-7';
    if (d <= 14) return '8-14';
    if (d <= 21) return '15-21';
    return '22-31';
  };
  // kumpulkan per minggu
  const weeklyMap: Record<string, number[]> = {};
  expenses.forEach(e => {
    const w = getWeekRange(e.createdAt);
    (weeklyMap[w] = weeklyMap[w] || []).push(e.amount);
  });
  const weekLabels = ['1-7','8-14','15-21','22-31'];
  const weekSums = weekLabels.map(w => 
    (weeklyMap[w] || []).reduce((a,b)=>a+b,0)
  );

  // regresi linear sederhana
  const linearRegression = (data: number[]) => {
    const n = data.length;
    const x = data.map((_,i)=>i+1);
    const sumX = x.reduce((a,b)=>a+b,0);
    const sumY = data.reduce((a,b)=>a+b,0);
    const sumXY = data.reduce((a,y,i)=>a+y*x[i],0);
    const sumX2 = x.reduce((a,xi)=>a+xi*xi,0);
    const m = (n*sumXY - sumX*sumY)/(n*sumX2 - sumX*sumX || 1);
    const b = (sumY - m*sumX)/n;
    const pred = m*(n+1)+b;
    return pred>0?pred:0;
  };
  const predictedTotal = linearRegression(weekSums);

  // data bar chart gifted
  const barData = weekLabels.map((lbl,i)=>({
    value: weekSums[i],
    label: lbl,
    frontColor: '#2978FA'
  }));

  // fungsi export
  const exportExcel = async () => {
    const ws = XLSX.utils.json_to_sheet(expenses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    const out = XLSX.write(wb, { bookType:'xlsx', type:'binary' });
    const path = `${RNFS.DownloadDirectoryPath}/report_${Date.now()}.xlsx`;
    await RNFS.writeFile(path, out, 'ascii');
    await Share.open({ url:'file://'+path });
  };
  const exportPDF = async () => {
    const html = `<h1>Prediksi Bulan Depan</h1>
      <p>Total: Rp ${predictedTotal.toLocaleString('id-ID')}</p>
      <h2>Riwayat:</h2><ul>
      ${expenses.map(e=>`<li>${e.type} - Rp ${e.amount.toLocaleString()}</li>`).join('')}
      </ul>`;
    const res = await RNHTMLtoPDF.convert({ html, fileName:`pdf_${Date.now()}` });
    await Share.open({ url:'file://'+res.filePath });
  };

  return (
    <View style={{ flex:1, backgroundColor:'#F0F4F8' }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prediction</Text>
        <TouchableOpacity>
          <Image
            source={ profileImage ? {uri:profileImage} : require('../icon/profile.png') }
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* SEGMENTED */}
      <View style={styles.segmented}>
        {(['Prediction','Analisis'] as const).map(tab=>(
          <TouchableOpacity
            key={tab}
            style={[
              styles.pill,
              activeTab===tab && styles.pillActive
            ]}
            onPress={()=>setActiveTab(tab)}
          >
            <Text style={[
              styles.pillText,
              activeTab===tab && styles.pillTextActive
            ]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom:80 }}>
        {activeTab==='Prediction' ? (
          <>
            {/* CARD */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Income & Expenses</Text>
                <View style={{ flexDirection:'row' }}>
                  <TouchableOpacity style={{ marginRight:12 }}>
                    <Ionicons name="search-outline" size={20} color="#555" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="calendar-outline" size={20} color="#555" />
                  </TouchableOpacity>
                </View>
              </View>
              <BarChart
                data={barData}
                width={screenWidth-64}
                height={180}
                barWidth={14}
                spacing={12}
                frontColor="#2978FA"
                yAxisTextStyle={{ fontSize:10, color:'#555' }}
                xAxisLabelTextStyle={{ fontSize:12, color:'#555' }}
              />
              <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="document-text-outline" size={18} color="#2978FA" />
                  <Text style={styles.iconBtnText}>
                    Expense Rp{predictedTotal.toLocaleString('id-ID')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="download-outline" size={18} color="#2978FA" />
                  <Text style={styles.iconBtnText}>Download Report</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* EXPORT */}
            <View style={styles.exportRow}>
              <TouchableOpacity style={[styles.exportBtn,{ backgroundColor:'#1E3A8A' }]} onPress={exportPDF}>
                <Text style={styles.exportText}>Export PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.exportBtn,{ backgroundColor:'#059669' }]} onPress={exportExcel}>
                <Text style={styles.exportText}>Export Excel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={{ padding:16 }}>
            <Text style={[styles.cardTitle,{ marginBottom:12 }]}>Analisis Pengeluaran</Text>
            {/* nanti list kategori */}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    backgroundColor:'#2978FA',
    padding:12, paddingHorizontal:16
  },
  headerTitle: { color:'#fff', fontSize:20, fontWeight:'bold' },
  avatar: { width:32, height:32, borderRadius:16 },

  segmented: {
    flexDirection:'row',
    backgroundColor:'#fff',
    marginHorizontal:16,
    marginTop:12,
    borderRadius:20,
    elevation:2,
    shadowColor:'#000',
    shadowOpacity:0.1,
    shadowOffset:{ width:0, height:1 }
  },
  pill: {
    flex:1,
    paddingVertical:8,
    alignItems:'center',
    borderRadius:20
  },
  pillActive:{ backgroundColor:'#2978FA' },
  pillText:{ color:'#555', fontWeight:'600' },
  pillTextActive:{ color:'#fff' },

  card: {
    backgroundColor:'#fff',
    margin:16,
    borderRadius:20,
    padding:16,
    elevation:3,
    shadowColor:'#000',
    shadowOpacity:0.1,
    shadowOffset:{ width:0, height:2 }
  },
  cardHeader:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:12
  },
  cardTitle:{ fontSize:16, fontWeight:'600' },
  cardFooter:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop:12
  },
  iconBtn:{ flexDirection:'row', alignItems:'center' },
  iconBtnText:{ marginLeft:6, color:'#2978FA', fontWeight:'600' },

  exportRow:{
    flexDirection:'row',
    marginHorizontal:16,
    marginTop:8
  },
  exportBtn:{
    flex:1,
    paddingVertical:14,
    borderRadius:8,
    alignItems:'center',
    marginHorizontal:4
  },
  exportText:{ color:'#fff', fontWeight:'600' }
});












