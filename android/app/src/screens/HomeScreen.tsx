import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Animated, Image
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultProfile from '../icon/profile.png';
import { useTheme } from '../context/ThemeSwitch';
import { getExpensesByUserId } from '../firebase/firebase';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);

  const [expenses, setExpenses] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const fixedColors = [
    '#2F5597', '#4472C4', '#5B9BD5', '#70AD47', '#FFC000', '#ED7D31', '#C00000'
  ];

  const chartData = expenses.map((e, i) => ({
    value: e.amount,
    color: fixedColors[i % fixedColors.length],
    text: e.type,
  }));

  const typeColorMap: { [key: string]: string } = {};
  chartData.forEach((item) => {
    typeColorMap[item.text] = item.color;
  });

  const totalBalance = expenses.reduce((sum, e) => sum + e.amount, 0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const loadData = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const storedName = await AsyncStorage.getItem('userName');
      const storedImage = await AsyncStorage.getItem('userProfile');

      if (storedName) setUserName(storedName);
      if (storedImage) setProfileImage(storedImage);

      if (!userId) return;
      const data = await getExpensesByUserId(userId);
      setExpenses(data);
    };

    loadData();
  }, [isDarkMode]);

  const renderExpense = ({ item }: any) => (
    <View style={styles.expenseRow}>
      <View style={[
        styles.expenseIcon,
        { backgroundColor: typeColorMap[item.type] || '#E0E0E0' }
      ]} />
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseLabel}>{item.type}</Text>
        <Text style={styles.expenseDate}>{item.createdAt?.slice(0, 10)}</Text>
      </View>
      <Text style={styles.expenseAmount}>
        -Rp {item.amount.toLocaleString('id-ID')}
      </Text>
    </View>
  );

  return (
    <Animated.View style={[styles.container, {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
      backgroundColor: isDarkMode ? '#121212' : '#FFFFFF'
    }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          ListHeaderComponent={
            <>
              <View style={{ position: 'relative' }}>
                <View style={[styles.headerGradient]} />
                <View style={{ position: 'absolute', top: 20, right: 20, zIndex: 1 }}>
                  <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                    <Image
                      source={profileImage ? { uri: profileImage } : defaultProfile}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.headerContent}>
                  <Text style={[styles.userGreeting, { color: isDarkMode ? '#FFF' : '#000' }]}>Hi, {userName}</Text>
                  <Text style={[styles.accountTitle, { color: isDarkMode ? '#FFF' : '#555' }]}>Main Account</Text>
                  <Text style={[styles.balance, { color: isDarkMode ? '#FFF' : '#111' }]}>Rp {totalBalance.toLocaleString('id-ID')}</Text>
                  <Text style={[styles.balanceChange, { color: isDarkMode ? '#D0E1FD' : '#1e40af' }]}>+Rp 2.775.000 bulan ini</Text>
                </View>
              </View>

              <View style={[styles.chartContainer, {
                backgroundColor: isDarkMode ? '#FFF' : 'transparent',
                borderRadius: 20,
                marginHorizontal: 16,
                paddingVertical: 12,
                elevation: isDarkMode ? 4 : 0,
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
              }]}>
                <PieChart
                  data={chartData}
                  donut
                  textColor="white"
                  textSize={12}
                  radius={90}
                  innerRadius={50}
                />
                <View style={styles.legendContainer}>
                  {chartData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.text}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.transactionHeader}>
                <Text style={styles.transactionTitle}>Recent Transactions</Text>
              </View>
            </>
          }
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExpense}
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
    </Animated.View>
  );
}

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#F0F4F8',
  },
  headerGradient: {
    height: 200,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    position: 'absolute',
    top: 40,
    width: '100%',
    alignItems: 'center',
  },
  userGreeting: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  accountTitle: { fontSize: 16 },
  balance: { fontSize: 32, fontWeight: 'bold' },
  balanceChange: { fontSize: 14, marginTop: 4 },
  chartContainer: { padding: 16, marginTop: 20, alignItems: 'center' },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 24,
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDarkMode ? '#EEE' : '#333',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#1f1f1f' : '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  expenseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  expenseInfo: { flex: 1 },
  expenseLabel: { fontSize: 16, color: isDarkMode ? '#EEE' : '#333' },
  expenseDate: { fontSize: 12, color: isDarkMode ? '#999' : '#888' },
  expenseAmount: { fontSize: 16, fontWeight: '600', color: '#E76F51' },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
});
