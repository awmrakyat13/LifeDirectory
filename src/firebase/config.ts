import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOfSDbEsZhcjVFrMR3wDe5hQbMpRvOPGA",
  authDomain: "lifedirectory-fa153.firebaseapp.com",
  projectId: "lifedirectory-fa153",
  storageBucket: "lifedirectory-fa153.firebasestorage.app",
  messagingSenderId: "303662213555",
  appId: "1:303662213555:web:810254d5d9f8d9927c03c6",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
