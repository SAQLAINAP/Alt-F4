import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDYlD826uG-v4zZZ1YSRW98oWgEjD__Z5o",
    authDomain: "altf4-3ee32.firebaseapp.com",
    projectId: "altf4-3ee32",
    storageBucket: "altf4-3ee32.firebasestorage.app",
    messagingSenderId: "545639547874",
    appId: "1:545639547874:web:4d9ac2c6081da901ba6fbb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
