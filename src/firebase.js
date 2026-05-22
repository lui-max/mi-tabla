import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/getFirestore";

const firebaseConfig = {
    apiKey:"AlzaSyAHwPw3osiiExIVIzkm1kft1eIIR6eJAdM",
    authDomain: "mi-tabla-45a6d.firebaseapp.com",
    projectId: "mi-tabla-45a6d",
    storageBucket: "mi-tabla-45a6d.firebasestorage.app",
    messagingSenderld: "274927308323",
    appId: "1:274927308323:web:8aaf1160d69a47f9b0eb96"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);