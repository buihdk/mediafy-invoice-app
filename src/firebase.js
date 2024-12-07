// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8MFfVv13zpSDbfD1Jttm3kE1PF9UdVa0",
  authDomain: "mediafy-invoice-app.firebaseapp.com",
  projectId: "mediafy-invoice-app",
  storageBucket: "mediafy-invoice-app.firebasestorage.app",
  messagingSenderId: "451126467377",
  appId: "1:451126467377:web:6983e8228bd69e81c5ae10",
  measurementId: "G-VG2H62B36K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };