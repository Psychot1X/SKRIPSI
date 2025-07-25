import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

export const firebaseAuth = auth();
export const db = firestore();

// Login
export const signInUser = (email: string, password: string) => {
  if (!email || !password) {
    throw { message: "Email dan password tidak boleh kosong." };
  }
  return firebaseAuth.signInWithEmailAndPassword(email, password);
};

// Register
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

// ✅ ADD EXPENSE: tidak override createdAt
export const addExpense = async (userId: string, expense: any) => {
  try {
    await db.collection('users').doc(userId).collection('expenses').add({
      amount: expense.amount,
      description: expense.description || '',
      category: expense.category,
      createdAt: expense.createdAt, // ✅ dari input user (ISO string)
      userId: userId,
    });
  } catch (e: any) {
    Alert.alert('Add Expense Error', e.message);
  }
};

// Ambil semua data pengeluaran user
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

// Cek apakah email sudah terdaftar
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

// Ambil semua user untuk admin
export const getAllUsers = async () => {
  try {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
  } catch (e: any) {
    Alert.alert('Fetch Users Error', e.message);
    return [];
  }
};
