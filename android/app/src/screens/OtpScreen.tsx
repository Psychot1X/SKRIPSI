// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert
// } from 'react-native';
// import { registerUser, db } from '../firebase/firebase';
// import { collection, addDoc } from 'firebase/firestore';

// export default function OtpScreen({ route, navigation }: any) {
//   const { otp, email, formData } = route.params;
//   const [inputOtp, setInputOtp] = useState('');

//   const verifyOtp = async () => {
//     const expectedOtp = String(otp);

//     if (inputOtp !== expectedOtp) {
//       Alert.alert('OTP Salah', 'Kode OTP yang kamu masukin salah. Coba lagi.');
//       return;
//     }

//     try {
//       const user = await registerUser(email, formData.password);
//       if (!user) return;

//       await addDoc(collection(db, 'users'), {
//         uid: user.uid,
//         name: formData.name,
//         email: formData.email,
//         dob: formData.dob,
//         gender: formData.gender,
//         phone: formData.phone,
//         job: formData.job,
//         createdAt: new Date().toISOString()
//       });

//       Alert.alert('Sukses', 'Akun berhasil dibuat');
//       navigation.navigate('Login');
//     } catch (error: any) {
//       console.error('❌ Insert gagal:', error.message);
//       Alert.alert('Error', error.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Verifikasi OTP</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Masukkan OTP"
//         keyboardType="numeric"
//         value={inputOtp}
//         onChangeText={setInputOtp}
//       />
//       <TouchableOpacity style={styles.button} onPress={verifyOtp}>
//         <Text style={styles.buttonText}>Verifikasi</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, backgroundColor: '#fff' },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', fontFamily: 'Poppins' },
//   input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10, fontSize: 18, marginBottom: 20 },
//   button: { backgroundColor: '#1d60e6', paddingVertical: 12, borderRadius: 10 },
//   buttonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }
// });
// src/screens/OtpScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { insertUser } from '../firebase/firebase';  // Panggil insertUser saja

export default function OtpScreen({ route, navigation }: any) {
  const { otp, formData } = route.params;
  const [inputOtp, setInputOtp] = useState('');

  const verifyOtp = () => {
    // 1) Validasi kode OTP
    if (inputOtp !== String(otp)) {
      Alert.alert('OTP Salah', 'Kode OTP yang kamu masukkan salah.');
      return;
    }

    // 2) Simpan user ke Firestore (tanpa Auth)
    insertUser(
      formData.name,
      formData.email,
      formData.password,
      formData.dob,
      formData.gender,
      formData.phone,
      formData.job,
      () => {
        // onSuccess
        Alert.alert('Sukses', 'Akun berhasil dibuat');
        navigation.navigate('Login');
      },
      (errMsg) => {
        // onError
        Alert.alert('Error', errMsg);
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifikasi OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Masukkan OTP"
        keyboardType="numeric"
        value={inputOtp}
        onChangeText={setInputOtp}
      />
      <TouchableOpacity style={styles.button} onPress={verifyOtp}>
        <Text style={styles.buttonText}>Verifikasi</Text>
      </TouchableOpacity>
    </View>
  );
}

// ----- Styles -----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20
  },
  button: {
    backgroundColor: '#1d60e6',
    paddingVertical: 14,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});


