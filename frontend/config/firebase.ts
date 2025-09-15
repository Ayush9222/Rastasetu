import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2OUk5HqDlkeXBLUiocbDTf4OGrxrteTM",
  authDomain: "rastasetu.firebaseapp.com",
  projectId: "rastasetu",
  storageBucket: "rastasetu.firebasestorage.app",
  messagingSenderId: "418007313547",
  appId: "1:418007313547:web:a76abc58cc7d09f030788e",
  measurementId: "G-G6RRPQ5LKM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
export const auth = getAuth(app);
export default app;