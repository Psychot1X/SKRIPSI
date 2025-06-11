// // ✅ LoginScreen.tsx (Firebase Version)
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Switch,
//   Image,
// } from 'react-native';
// import { loginUser } from '../firebase/firebase';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export function LoginScreen({ navigation }: any) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   const ADMIN_CREDENTIAL = {
//     email: 'admin123',
//     password: 'adminpass',
//   };

//   const handleLogin = async () => {
//     if (email === ADMIN_CREDENTIAL.email && password === ADMIN_CREDENTIAL.password) {
//       navigation.navigate('Admin');
//       return;
//     }

//     const user = await loginUser(email, password);
//     if (user) {
//       await AsyncStorage.setItem('userId', user.uid);
//       await AsyncStorage.setItem('userEmail', email);
//       navigation.navigate('Main');
//     } else {
//       Alert.alert('Login Failed', 'Email atau password salah');
//     }
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
//       <View style={styles.headerRow}>
//         <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>Login</Text>
//         <View style={styles.switchRow}>
//           <Text style={{ color: isDarkMode ? '#fff' : '#000', marginRight: 10 }}>Dark Mode</Text>
//           <Switch
//             value={isDarkMode}
//             onValueChange={setIsDarkMode}
//             trackColor={{ false: '#767577', true: '#81b0ff' }}
//             thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
//           />
//         </View>
//       </View>

//       <TextInput
//         placeholder="Email"
//         placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
//         style={[styles.input, {
//           backgroundColor: isDarkMode ? '#2a2a2a' : '#f1f5f9',
//           color: isDarkMode ? '#fff' : '#000',
//           borderColor: isDarkMode ? '#333' : '#e2e8f0'
//         }]}
//         keyboardType="email-address"
//         onChangeText={setEmail}
//         value={email}
//       />

//       <View style={[styles.input, {
//         backgroundColor: isDarkMode ? '#2a2a2a' : '#f1f5f9',
//         borderColor: isDarkMode ? '#333' : '#e2e8f0',
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 0
//       }]}
//       >
//         <TextInput
//           placeholder="Password"
//           placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
//           style={{ flex: 1, color: isDarkMode ? '#fff' : '#000', fontSize: 16, paddingVertical: 14 }}
//           secureTextEntry={!showPassword}
//           onChangeText={setPassword}
//           value={password}
//         />
//         <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//           <Image
//             source={showPassword ? require('../icon/hide.png') : require('../icon/show.png')}
//             style={{ width: 20, height: 20, tintColor: isDarkMode ? '#ccc' : '#666' }}
//           />
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Log in</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.navigate('Register')}>
//         <Text style={[styles.link, { color: isDarkMode ? '#90cdf4' : '#2563eb' }]}>Don't have an account? Register</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     justifyContent: 'center'
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 24
//   },
//   switchRow: {
//     flexDirection: 'row',
//     alignItems: 'center'
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     fontFamily: 'Poppins'
//   },
//   input: {
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderRadius: 8,
//     marginBottom: 16,
//     fontSize: 16,
//     borderWidth: 1
//   },
//   button: {
//     backgroundColor: '#2563eb',
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 8,
//     elevation: 2
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16
//   },
//   link: {
//     marginTop: 20,
//     textAlign: 'center',
//     fontWeight: '500',
//     fontFamily: 'Poppins'
//   }
// });

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase/firebase';            // hanya db
import { collection, query, where, getDocs } from 'firebase/firestore';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const ADMIN_CREDENTIAL = {
    email: 'admin123',
    password: 'adminpass',
  };

  const handleLogin = async () => {
    // 1) Login admin
    if (email === ADMIN_CREDENTIAL.email && password === ADMIN_CREDENTIAL.password) {
      navigation.navigate('Admin');
      return;
    }

    // 2) Login Firestore‐only
    try {
      const q = query(
        collection(db, 'users'),
        where('email', '==', email),
        where('password', '==', password)   // password stored plaintext
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const userDoc = snap.docs[0];
        await AsyncStorage.setItem('userId', userDoc.id);
        await AsyncStorage.setItem('userEmail', email);
        navigation.navigate('Main');
      } else {
        Alert.alert('Login Failed', 'Email atau password salah');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>Login</Text>
        <View style={styles.switchRow}>
          <Text style={{ color: isDarkMode ? '#fff' : '#000', marginRight: 10 }}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <TextInput
        placeholder="Email"
        placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
        style={[styles.input, {
          backgroundColor: isDarkMode ? '#2a2a2a' : '#f1f5f9',
          color: isDarkMode ? '#fff' : '#000',
          borderColor: isDarkMode ? '#333' : '#e2e8f0'
        }]}
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />

      <View style={[styles.input, {
        backgroundColor: isDarkMode ? '#2a2a2a' : '#f1f5f9',
        borderColor: isDarkMode ? '#333' : '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 0
      }]}>
        <TextInput
          placeholder="Password"
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          style={{ flex: 1, color: isDarkMode ? '#fff' : '#000', fontSize: 16, paddingVertical: 14 }}
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
          value={password}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={showPassword ? require('../icon/hide.png') : require('../icon/show.png')}
            style={{ width: 20, height: 20, tintColor: isDarkMode ? '#ccc' : '#666' }}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={[styles.link, { color: isDarkMode ? '#90cdf4' : '#2563eb' }]}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 24, justifyContent: 'center'
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24
  },
  switchRow: {
    flexDirection: 'row', alignItems: 'center'
  },
  title: {
    fontSize: 22, fontWeight: 'bold'
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1
  },
  button: {
    backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold', fontSize: 16
  },
  link: {
    marginTop: 20, textAlign: 'center', fontWeight: '500'
  }
});

