import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase (la misma que usas en el backend)
const firebaseConfig = {
  apiKey: "AIzaSyC-76LOBy3rrvOG80dQiEVBXhDJ6DQltRg",
  authDomain: "pruebasremsapp.firebaseapp.com",
  projectId: "pruebasremsapp",
  storageBucket: "pruebasremsapp.firebasestorage.app",
  messagingSenderId: "730949923748",
  appId: "1:730949923748:web:3089445588be2dd80c4731",
  measurementId: "G-DPGXHV38S0"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };