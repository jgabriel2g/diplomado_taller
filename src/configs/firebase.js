import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBa5jDl7nb2dBiPHIxGah9-sMQxx68iLMI",
  authDomain: "final-proyect-713a1.firebaseapp.com",
  projectId: "final-proyect-713a1",
  storageBucket: "final-proyect-713a1.firebasestorage.app",
  messagingSenderId: "528136491487",
  appId: "1:528136491487:web:1d4fd23d933b1c72a9746a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db, app };
