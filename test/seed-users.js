require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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
      await setDoc(doc(db, "users", uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(` Usuario creado: ${user.name} (${user.email})`);
    } catch (error) {
      console.error(` Error creando usuario ${user.name}:`, error);
    }
  }
  console.log("--- Finalizado ---\n");
}

if (require.main === module) {
  seedUsers().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedUsers, testUsers };
