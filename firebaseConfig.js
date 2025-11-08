// Firebase config and initialization for React Native (Expo)
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBXWF0OyHPV0hp39cG4lp27ipxzTCq3bmg",
  authDomain: "sujooddiary.firebaseapp.com",
  databaseURL: "https://sujooddiary-default-rtdb.firebaseio.com",
  projectId: "sujooddiary",
  storageBucket: "sujooddiary.firebasestorage.app",
  messagingSenderId: "736003063039",
  appId: "1:736003063039:web:2a3bd2f1cf71da583fe0ca",
  measurementId: "G-MB9EK7NFNE"
};

// Initialize Firebase (prevent multiple initializations)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const database = getDatabase(app);

// Initialize Auth with AsyncStorage persistence (prevent double initialization)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Auth already initialized, get existing instance
  auth = getAuth(app);
}

export { app, db, database, auth };
