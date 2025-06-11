import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Image, Switch, Platform, Alert, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import validator from 'validator';
import { sendOtp } from '../utils/sendOtp';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [job, setJob] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const onChangeDate = (event: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setDob(formatted);
    }
  };

  const handleRegister = async () => {
    if (
      !name || !email || !password || !confirmPassword || !dob || !gender || !phone || !job ||
      (['Karyawan Swasta', 'Wirausahawan', 'Lainnya'].includes(job) && !jobDescription)
    ) {
      Alert.alert('Semua field wajib diisi!');
      return;
    }

    if (!validator.isEmail(email.trim())) {
      Alert.alert('Format email tidak valid!');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak sama');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const fullJob = job + (jobDescription ? ` - ${jobDescription}` : '');
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      await sendOtp(cleanEmail, otpCode);
      navigation.navigate('OtpScreen', {
        otp: otpCode,
        email: cleanEmail,
        formData: {
          name,
          email: cleanEmail,
          password,
          dob,
          gender,
          phone,
          job: fullJob
        }
      });
    } catch (err) {
      Alert.alert('Gagal mengirim OTP', 'Coba lagi nanti.');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>Register</Text>

      <View style={styles.switchContainer}>
        <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
      </View>

      {/* Nama */}
      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Nama</Text>
      <TextInput
        style={[styles.input, { color: isDarkMode ? '#fff' : '#000' }]}
        placeholder="Nama"
        placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
        value={name}
        onChangeText={setName}
      />

      {/* Email */}
      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Email</Text>
      <TextInput
        style={[styles.input, { color: isDarkMode ? '#fff' : '#000' }]}
        placeholder="Email"
        placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Tanggal Lahir */}
      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Tanggal Lahir</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
        <Text style={{ color: dob ? (isDarkMode ? '#fff' : '#000') : '#888' }}>
          {dob || 'Pilih tanggal'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
        />
      )}

      {/* Gender */}
      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Gender</Text>
      <Picker
        selectedValue={gender}
        onValueChange={(val) => setGender(val)}
        style={[styles.picker, { color: isDarkMode ? '#fff' : '#000' }]}
      >
        <Picker.Item label="Pilih gender" value="" />
        <Picker.Item label="Laki-laki" value="Laki-laki" />
        <Picker.Item label="Perempuan" value="Perempuan" />
      </Picker>

      {/* Phone */}
      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>No HP</Text>
      <TextInput
        style={[styles.input, { color: isDarkMode ? '#fff' : '#000' }]}
        placeholder="08123456789"
        placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Pekerjaan */}
      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Pekerjaan</Text>
      <Picker
        selectedValue={job}
        onValueChange={(val) => setJob(val)}
        style={[styles.picker, { color: isDarkMode ? '#fff' : '#000' }]}
      >
        <Picker.Item label="Pilih pekerjaan" value="" />
        <Picker.Item label="Pelajar/Mahasiswa" value="Pelajar/Mahasiswa" />
        <Picker.Item label="Karyawan Swasta" value="Karyawan Swasta" />
        <Picker.Item label="Wirausahawan" value="Wirausahawan" />
        <Picker.Item label="Lainnya" value="Lainnya" />
      </Picker>

      {['Karyawan Swasta', 'Wirausahawan', 'Lainnya'].includes(job) && (
        <>
          <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Jelaskan Pekerjaan</Text>
          <TextInput
            style={[styles.input, { color: isDarkMode ? '#fff' : '#000' }]}
            placeholder="Contoh: Staff IT di PT. ABC"
            placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
            value={jobDescription}
            onChangeText={setJobDescription}
          />
        </>
      )}

      {/* Password */}
      {[{
        label: 'Password',
        value: password,
        setter: setPassword,
        show: showPassword,
        toggle: () => setShowPassword(!showPassword)
      }, {
        label: 'Confirm Password',
        value: confirmPassword,
        setter: setConfirmPassword,
        show: showConfirmPassword,
        toggle: () => setShowConfirmPassword(!showConfirmPassword)
      }].map((field, index) => (
        <View key={index}>
          <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>{field.label}</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { flex: 1, color: isDarkMode ? '#fff' : '#000' }]}
              placeholder={field.label}
              placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
              secureTextEntry={!field.show}
              value={field.value}
              onChangeText={(text) => {
                field.setter(text);
                if (field.label === 'Confirm Password' && password !== text) {
                  setPasswordError('Konfirmasi password tidak sama');
                } else {
                  setPasswordError('');
                }
              }}
            />
            <TouchableOpacity onPress={field.toggle}>
              <Image
                source={field.show ? require('../icon/hide.png') : require('../icon/show.png')}
                style={{ width: 20, height: 20, tintColor: isDarkMode ? '#ccc' : '#555' }}
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {passwordError ? <Text style={{ color: 'red' }}>{passwordError}</Text> : null}

      {/* Tombol Daftar */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Daftar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
        <Text style={[styles.bottomText, { color: isDarkMode ? '#bbb' : '#666' }]}>
          Sudah punya akun? <Text style={styles.link}>Login di sini</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  label: {
    marginTop: 10,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#1d60e6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  picker: {
    borderWidth: 1,
    borderColor: '#1d60e6',
    borderRadius: 8,
    marginBottom: 8
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#1d60e6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#1d60e6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16
  },
  bottomText: {
    textAlign: 'center'
  },
  link: {
    color: '#1d60e6',
    fontWeight: 'bold'
  }
});
