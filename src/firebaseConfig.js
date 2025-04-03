import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase (la misma que usas en el backend)
const firebaseConfig = {
    apiKey: "AIzaSyDeTYJeTCnQcBM0fHF9_iis4WJeGCzn2Cw",
    authDomain: "pfinalsda.firebaseapp.com",
    projectId: "pfinalsda",
    storageBucket: "pfinalsda.firebasestorage.app",
    messagingSenderId: "539157276780",
    appId: "1:539157276780:web:3f6e566be2d3f251531049",
    measurementId: "G-G3GL6CT8FE"
  };

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };