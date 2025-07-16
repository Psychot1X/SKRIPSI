// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// import { Alert } from 'react-native';

// export const firebaseAuth = auth();
// export const db = firestore();

// export const registerUser = async (formData: any) => {
//   const { email, password, name, dob, gender, phone, job } = formData;

//   if (!email || !password) {
//     throw { message: "Email dan password tidak boleh kosong." };
//   }

//   const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
//   const user = userCredential.user;

//   await db.collection('users').doc(user.uid).set({
//     uid: user.uid,
//     name,
//     email,
//     dob,
//     gender,
//     phone,
//     job,
//     createdAt: firestore.FieldValue.serverTimestamp(),
//   });

//   return userCredential;
// };

// export const addExpense = async (userId: string, expense: any) => {
//   try {
//     await db.collection('users').doc(userId).collection('expenses').add({
//       ...expense,
//       createdAt: firestore.FieldValue.serverTimestamp(),
//     });
//   } catch (e: any) {
//     Alert.alert('Add Expense Error', e.message);
//   }
// };

// export const getExpensesByUserId = async (userId: string) => {
//   try {
//     const snapshot = await db
//       .collection('users')
//       .doc(userId)
//       .collection('expenses')
//       .get();

//     return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
//   } catch (e: any) {
//     Alert.alert('Fetch Expense Error', e.message);
//     return [];
//   }
// };

// export const checkUserExists = async (email: string): Promise<boolean> => {
//   try {
//     const snapshot = await db
//       .collection('users')
//       .where('email', '==', email)
//       .get();
//     return !snapshot.empty;
//   } catch (e: any) {
//     Alert.alert('Check Email Error', e.message);
//     return false;
//   }
// };

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

export const firebaseAuth = auth();
export const db = firestore();

// FUNGSI LOGIN DENGAN TIPE DATA YANG BENAR
export const signInUser = (email: string, password: string) => {
  if (!email || !password) {
    throw { message: "Email dan password tidak boleh kosong." };
  }
  return firebaseAuth.signInWithEmailAndPassword(email, password);
};

export const registerUser = async (formData: any) => {
  const { email, password, name, dob, gender, phone, job } = formData;

  if (!email || !password) {
    throw { message: "Email dan password tidak boleh kosong." };
  }

  const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;

  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    name,
    email,
    dob,
    gender,
    phone,
    job,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  return userCredential;
};

export const addExpense = async (userId: string, expense: any) => {
  try {
    await db.collection('users').doc(userId).collection('expenses').add({
      ...expense,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (e: any) {
    Alert.alert('Add Expense Error', e.message);
  }
};

export const getExpensesByUserId = async (userId: string) => {
  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('expenses')
      .get();

    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e: any) {
    Alert.alert('Fetch Expense Error', e.message);
    return [];
  }
};

export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const snapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();
    return !snapshot.empty;
  } catch (e: any) {
    Alert.alert('Check Email Error', e.message);
    return false;
  }
};