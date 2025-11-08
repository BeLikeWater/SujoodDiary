// Firebase config and initialization for React Native (Expo)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXWF0OyHPV0hp39cG4lp27ipxzTCq3bmg",
  authDomain: "sujooddiary.firebaseapp.com",
  projectId: "sujooddiary",
  storageBucket: "sujooddiary.firebasestorage.app",
  messagingSenderId: "736003063039",
  appId: "1:736003063039:web:2a3bd2f1cf71da583fe0ca",
  measurementId: "G-MB9EK7NFNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
