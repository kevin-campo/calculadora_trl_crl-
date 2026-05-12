import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim()
};

// Log de diagnóstico (solo en desarrollo y cliente)
if (typeof window !== "undefined") {
  const pid = firebaseConfig.projectId;
  console.log("🔥 Firebase Config: ID del Proyecto cargado ->", pid || "FALTA CONFIGURACIÓN");
  
  if (!pid || pid === "undefined" || pid === "trl-crl") {
    console.warn("ℹ️ AYUDA: Si recibes un error 404, asegúrate de que '" + pid + "' sea el ID exacto que aparece en tu Consola de Firebase > Configuración del proyecto.");
  }
}

// Inicialización ultra-segura
let app;
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

try {
  if (isConfigValid) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
  } else {
    if (typeof window !== "undefined") {
      console.error("❌ Configuración de Firebase incompleta. Revisa .env.local");
    }
  }
} catch (error) {
  console.error("❌ Error inicializando Firebase:", error);
}

// Inicializar servicios solo si el app existe
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;

// Analytics (solo en cliente)
export const analytics = (typeof window !== "undefined" && app)
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : null;

export default app;
