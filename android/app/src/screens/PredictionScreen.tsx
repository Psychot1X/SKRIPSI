import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
import { useTheme } from '../context/ThemeSwitch';

const screenWidth = Dimensions.get('window').width;

export default function PredictionScreen({ navigation }: any) {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);
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

  // Week utilities
  const getWeekRange = (dateStr: string) => {
    const d = new Date(dateStr).getDate();
    if (d <= 7) return '1-7';
    if (d <= 14) return '8-14';
    if (d <= 21) return '15-21';
    return '22-31';
  };
  const weeklyMap: Record<string, number[]> = {};
  expenses.forEach(e => {
    const w = getWeekRange(e.createdAt);
    (weeklyMap[w] = weeklyMap[w] || []).push(e.amount);
  });
  const weekLabels = ['1-7','8-14','15-21','22-31'];
  const weekSums = weekLabels.map(w =>
    (weeklyMap[w] || []).reduce((a,b)=>a+b,0)
  );

  // Linear regression
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

  // Bar data
  const barData = weekLabels.map((lbl,i)=>({
    value: weekSums[i],
    label: lbl,
    frontColor: isDarkMode ? '#60A5FA' : '#2978FA'
  }));

  // Export functions
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
    <View style={styles.bg}>
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

      {/* SEGMENTED CONTROL */}
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
                    <Ionicons name="search-outline" size={20} color={isDarkMode ? '#aaa' : '#555'} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="calendar-outline" size={20} color={isDarkMode ? '#aaa' : '#555'} />
                  </TouchableOpacity>
                </View>
              </View>
              <BarChart
                data={barData}
                width={screenWidth-64}
                height={180}
                barWidth={14}
                spacing={12}
                frontColor={isDarkMode ? '#60A5FA' : '#2978FA'}
                yAxisTextStyle={{ fontSize:10, color:isDarkMode ? '#aaa' : '#555' }}
                xAxisLabelTextStyle={{ fontSize:12, color:isDarkMode ? '#aaa' : '#555' }}
              />
              <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="document-text-outline" size={18} color={isDarkMode ? '#60A5FA' : '#2978FA'} />
                  <Text style={styles.iconBtnText}>
                    Expense Rp{predictedTotal.toLocaleString('id-ID')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="download-outline" size={18} color={isDarkMode ? '#60A5FA' : '#2978FA'} />
                  <Text style={styles.iconBtnText}>Download Report</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* EXPORT BUTTONS */}
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
            {/* Analisis pengeluaran by kategori bisa lanjut di sini */}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  bg: { flex:1, backgroundColor: isDarkMode ? '#121212' : '#F0F4F8' },
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
    backgroundColor: isDarkMode ? '#23262f' : '#fff',
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
  pillText:{ color: isDarkMode ? '#ccc' : '#555', fontWeight:'600' },
  pillTextActive:{ color:'#fff' },

  card: {
    backgroundColor: isDarkMode ? '#23262f' : '#fff',
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
  cardTitle:{ fontSize:16, fontWeight:'600', color: isDarkMode ? '#fff' : '#222' },
  cardFooter:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop:12
  },
  iconBtn:{ flexDirection:'row', alignItems:'center' },
  iconBtnText:{ marginLeft:6, color: isDarkMode ? '#60A5FA' : '#2978FA', fontWeight:'600' },

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
