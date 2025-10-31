import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration, using the valid keys you provided.
const firebaseConfig = {
  apiKey: "AIzaSyDlN5J2tlxo2rJ9WaHWtmK_HWNKCmPjGAE",
  authDomain: "automate-sales-call.firebaseapp.com",
  databaseURL: "https://automate-sales-call-default-rtdb.firebaseio.com",
  projectId: "automate-sales-call",
  storageBucket: "automate-sales-call.firebasestorage.app",
  messagingSenderId: "100854714204",
  appId: "1:100854714204:web:77e064cdb9819b81063b99",
  measurementId: "G-0Q3XLSZC27"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
