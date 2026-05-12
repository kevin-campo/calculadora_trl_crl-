require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Intentar cargar la llave de servicio
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
let db;

if (fs.existsSync(serviceAccountPath)) {
  if (!admin.apps.length) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  db = admin.firestore();
} else {
  console.error(" ERROR: No se encontró serviceAccountKey.json en la raíz.");
  process.exit(1);
}

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
      await db.collection("diagnostics").add({
        ...diag,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        timestamp: new Date().toISOString()
      });
      console.log(`Diagnóstico creado para: ${diag.profile.org} (${diag.profile.title})`);
    } catch (error) {
      console.error(` ERROR creando diagnóstico para ${diag.profile.org}:`, error);
    }
  }
  console.log("--- Finalizado ---\n");
}

if (require.main === module) {
  seedDiagnostics().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedDiagnostics };
