require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Intentar cargar la llave de servicio para saltar reglas de seguridad
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
let db;

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  db = admin.firestore();
  console.log("🔐 Usando Firebase Admin SDK (Privilegios de administrador)");
} else {
  console.error("❌ ERROR: No se encontró serviceAccountKey.json en la raíz.");
  console.error("Para ejecutar tests con reglas restrictivas, necesitas este archivo.");
  process.exit(1);
}

const testUsers = [
  {
    uid: "test_user_001",
    name: "Juan Perez",
    email: "juan.perez@test.com",
    role: "user",
    provider: "Email"
  },
  {
    uid: "test_user_002",
    name: "Maria Garcia",
    email: "maria.garcia@test.com",
    role: "user",
    provider: "Google"
  },
  {
    uid: "test_admin_001",
    name: "Admin de Prueba",
    email: "admin@trl-crl.com",
    role: "admin",
    provider: "Email"
  }
];

async function seedUsers() {
  console.log("--- Iniciando inserción de usuarios de prueba ---");
  for (const user of testUsers) {
    try {
      const { uid, ...userData } = user;
      await db.collection("users").doc(uid).set({
        ...userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(` Usuario creado: ${user.name} (${user.email})`);
    } catch (error) {
      console.error(` ERROR creando usuario ${user.name}:`, error);
    }
  }
  console.log("--- Finalizado ---\n");
}

if (require.main === module) {
  seedUsers().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedUsers, testUsers };
