// import { initializeApp, getApps, getApp } from 'firebase/app';
// import {
//   getAuth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword
// } from 'firebase/auth';
// import {
//   getFirestore,
//   collection,
//   addDoc,
//   getDocs,
//   query,
//   where,
//   deleteDoc,
//   doc
// } from 'firebase/firestore';
// import { Alert } from 'react-native';

// // ✅ Konfigurasi Firebase
// const firebaseConfig = {
//   apiKey: "AIzaSyCT3sYgFgiVrflt3tSFzXtpy3eT7Z647Sk",
//   authDomain: "financeapp-8fce1.firebaseapp.com",
//   projectId: "financeapp-8fce1",
//   storageBucket: "financeapp-8fce1.firebasestorage.app",
//   messagingSenderId: "106213925680",
//   appId: "1:106213925680:web:e7f1fb801e4edcba5c9ef5",
//   measurementId: "G-Y3WTYY97XJ"
// };

// // ✅ Inisialisasi Firebase cuma sekali (anti error dobel)
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
// const auth = getAuth(app);
// const db = getFirestore(app);

// // ✅ Tipe user (biar gak error di AdminUserList)
// interface User {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   job: string;
// }

// // ✅ Register user ke Auth
// const registerUser = async (email: string, password: string) => {
//   try {
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     return userCredential.user;
//   } catch (error: any) {
//     Alert.alert('Register Error', error.message);
//     return null;
//   }
// };

// // ✅ Simpan data user ke Firestore
// const insertUser = async (
//   name: string,
//   email: string,
//   password: string,
//   dob: string,
//   gender: string,
//   phone: string,
//   job: string,
//   onSuccess: () => void,
//   onError: (err: string) => void
// ) => {
//   try {
//     await addDoc(collection(db, 'users'), {
//       name,
//       email,
//       password,
//       dob,
//       gender,
//       phone,
//       job,
//       createdAt: new Date().toISOString()
//     });
//     onSuccess();
//   } catch (error: any) {
//     onError(error.message || 'Gagal menyimpan data user');
//   }
// };

// // ✅ Login user
// const loginUser = async (email: string, password: string) => {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     return userCredential.user;
//   } catch (error: any) {
//     Alert.alert('Login Error', error.message);
//     return null;
//   }
// };

// // ✅ Tambah expense
// const addExpense = async (userId: string, expense: any) => {
//   try {
//     await addDoc(collection(db, 'expenses'), {
//       ...expense,
//       user_id: userId,
//       createdAt: new Date().toISOString(),
//     });
//   } catch (error: any) {
//     Alert.alert('Add Expense Error', error.message);
//   }
// };

// // ✅ Ambil expense berdasarkan userId
// const getExpensesByUserId = async (userId: string) => {
//   try {
//     const q = query(collection(db, 'expenses'), where('user_id', '==', userId));
//     const snapshot = await getDocs(q);
//     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//   } catch (error: any) {
//     Alert.alert('Fetch Expense Error', error.message);
//     return [];
//   }
// };

// // ✅ Cek apakah email udah ada
// const checkUserExists = async (email: string): Promise<boolean> => {
//   try {
//     const q = query(collection(db, 'users'), where('email', '==', email));
//     const snapshot = await getDocs(q);
//     return !snapshot.empty;
//   } catch (error: any) {
//     Alert.alert('Check Email Error', error.message);
//     return false;
//   }
// };

// // ✅ Ambil semua user (AdminUserList)
// const getAllUsers = async (): Promise<User[]> => {
//   try {
//     const snapshot = await getDocs(collection(db, 'users'));
//     return snapshot.docs.map((doc) => {
//       const data = doc.data();
//       return {
//         id: doc.id,
//         name: data.name || '',
//         email: data.email || '',
//         phone: data.phone || '',
//         job: data.job || ''
//       };
//     });
//   } catch (error: any) {
//     Alert.alert('Get Users Error', error.message);
//     return [];
//   }
// };

// // ✅ Hapus semua user kecuali admin
// const deleteAllUsersExceptAdmin = async () => {
//   try {
//     const snapshot = await getDocs(collection(db, 'users'));
//     const adminEmail = 'admin123';
//     const deletePromises = snapshot.docs
//       .filter(doc => doc.data().email !== adminEmail)
//       .map(doc => deleteDoc(doc.ref));

//     await Promise.all(deletePromises);
//     Alert.alert('Sukses', 'Semua user kecuali admin dihapus');
//   } catch (error: any) {
//     Alert.alert('Delete Error', error.message);
//   }
// };

// export {
//   db,
//   auth,
//   app,
//   registerUser,
//   insertUser,
//   loginUser,
//   addExpense,
//   getExpensesByUserId,
//   checkUserExists,
//   getAllUsers,
//   deleteAllUsersExceptAdmin,
// };

// src/firebase/firebase.ts
// src/firebase/firebase.ts
// src/firebase/firebase.ts
// src/firebase/firebase.ts
// src/firebase/firebase.ts
// src/firebase/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { Alert } from 'react-native';

////////////////////////////////////////////////////////////////////////////////
// 1) INISIALISASI APP & FIRESTORE                                          //
////////////////////////////////////////////////////////////////////////////////

const firebaseConfig = {
  apiKey: "AIzaSyCT3sYgFgiVrflt3tSFzXtpy3eT7Z647Sk",
  authDomain: "financeapp-8fce1.firebaseapp.com",
  projectId: "financeapp-8fce1",
  storageBucket: "financeapp-8fce1.firebasestorage.app",
  messagingSenderId: "106213925680",
  appId: "1:106213925680:web:e7f1fb801e4edcba5c9ef5",
  measurementId: "G-Y3WTYY97XJ"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

const db = getFirestore(app);

////////////////////////////////////////////////////////////////////////////////
// 2) HELPERS FIRESTORE                                                      //
////////////////////////////////////////////////////////////////////////////////

/** Simpan profil user lengkap via Firestore */
export const insertUser = async (
  name: string,
  email: string,
  password: string,
  dob: string,
  gender: string,
  phone: string,
  job: string,
  onSuccess: () => void,
  onError: (msg: string) => void
) => {
  try {
    await addDoc(collection(db, 'users'), {
      name,
      email,
      password,
      dob,
      gender,
      phone,
      job,
      createdAt: new Date().toISOString()
    });
    onSuccess();
  } catch (e: any) {
    onError(e.message || 'Gagal menyimpan data user');
  }
};

/** Tambah pengeluaran user */
export const addExpense = async (userId: string, expense: any) => {
  try {
    await addDoc(collection(db, 'expenses'), {
      ...expense,
      user_id: userId,
      createdAt: new Date().toISOString()
    });
  } catch (e: any) {
    Alert.alert('Add Expense Error', e.message);
  }
};

/** Ambil pengeluaran untuk user tertentu */
export const getExpensesByUserId = async (userId: string) => {
  try {
    const q = query(collection(db, 'expenses'), where('user_id', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e: any) {
    Alert.alert('Fetch Expense Error', e.message);
    return [];
  }
};

/** Cek apakah email sudah terdaftar di Firestore */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (e: any) {
    Alert.alert('Check Email Error', e.message);
    return false;
  }
};

/** Ambil semua profil user */
export const getAllUsers = async (): Promise<any[]> => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  } catch (e: any) {
    Alert.alert('Get Users Error', e.message);
    return [];
  }
};

/** Hapus semua user kecuali admin */
export const deleteAllUsersExceptAdmin = async () => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const promises = snap.docs
      .filter(d => (d.data() as any).email !== 'admin123')
      .map(d => deleteDoc(d.ref));
    await Promise.all(promises);
    Alert.alert('Sukses', 'Semua user kecuali admin dihapus');
  } catch (e: any) {
    Alert.alert('Delete Error', e.message);
  }
};

////////////////////////////////////////////////////////////////////////////////
// 3) EKSPOR                                                                //
////////////////////////////////////////////////////////////////////////////////

export { db };




