require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testDiagnostics = [
  {
    userId: "test_user_001",
    profile: {
      org: "Tech Innovators S.A.",
      title: "Proyecto Solar Alfa",
      description: "Sistema de paneles solares de alta eficiencia"
    },
    summary: {
      pct: 85,
      total: 170,
      max: 200
    }
  },
  {
    userId: "test_user_002",
    profile: {
      org: "BioHealth Lab",
      title: "Sensor Glucosa 2.0",
      description: "Prototipo de sensor no invasivo"
    },
    summary: {
      pct: 45,
      total: 90,
      max: 200
    }
  },
  {
    userId: "test_user_001",
    profile: {
      org: "Tech Innovators S.A.",
      title: "Redes 5G Privadas",
      description: "Infraestructura para industria 4.0"
    },
    summary: {
      pct: 20,
      total: 40,
      max: 200
    }
  }
];

async function seedDiagnostics() {
  console.log("--- Iniciando inserción de diagnósticos de prueba ---");
  for (const diag of testDiagnostics) {
    try {
      await addDoc(collection(db, "diagnostics"), {
        ...diag,
        createdAt: serverTimestamp(),
        timestamp: new Date().toISOString()
      });
      console.log(` Diagnóstico creado para: ${diag.profile.org} (${diag.profile.title})`);
    } catch (error) {
      console.error(` Error creando diagnóstico para ${diag.profile.org}:`, error);
    }
  }
  console.log("--- Finalizado ---\n");
}

if (require.main === module) {
  seedDiagnostics().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedDiagnostics };
