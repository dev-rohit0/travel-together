import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth,getReactNativePersistence } from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
    apiKey: "AIzaSyBzuIFIk_Ze_WB_cmroOt2FpeoAPn97Z5E",
    authDomain: "travvel-cfd85.firebaseapp.com",
    projectId: "travvel-cfd85",
    storageBucket: "travvel-cfd85.appspot.com",
    messagingSenderId: "892477933433",
    appId: "1:892477933433:web:14308b0678a022656991a8",
    measurementId: "G-RX4GL6GYTL"
};

const authPersistence = getReactNativePersistence(AsyncStorage); // Use AsyncStorage for persistence

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, authPersistence);
export const database = getFirestore();
export const storage = getStorage();

