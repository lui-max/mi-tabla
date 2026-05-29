import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHwPw3osiiExlVIzkm1kfT1elIR6eJAdM",
  authDomain: "mi-tabla-45a6d.firebaseapp.com",
  projectId: "mi-tabla-45a6d",
  storageBucket: "mi-tabla-45a6d.firebasestorage.app",
  messagingSenderId: "274927308323",
  appId: "1:274927308323:web:8aaf1160d69a47f9b0eb96"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);