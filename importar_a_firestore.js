/**
 * Script para importar los datos a Firebase Firestore
 *
 * REQUISITOS:
 *   node --version  (debe ser v14 o superior)
 *   npm install firebase-admin
 *
 * USO:
 *   1. Descarga tu serviceAccountKey.json desde Firebase Console:
 *      Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada
 *   2. Coloca estos 3 archivos en la misma carpeta:
 *        - importar_a_firestore.js  (este archivo)
 *        - firebase_data.json
 *        - serviceAccountKey.json
 *   3. Abre la terminal en esa carpeta y ejecuta:
 *        npm install firebase-admin
 *        node importar_a_firestore.js
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const data = require("./firebase_data.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importar() {
  const colecciones = Object.keys(data);
  console.log(`\n🚀 Iniciando importación de ${colecciones.length} colecciones...\n`);

  for (const coleccion of colecciones) {
    const registros = data[coleccion];
    const ids = Object.keys(registros);
    console.log(`📂 ${coleccion}: ${ids.length} registros`);

    // Firestore permite máximo 500 escrituras por lote
    const LOTE_MAX = 500;
    for (let i = 0; i < ids.length; i += LOTE_MAX) {
      const lote = db.batch();
      const chunk = ids.slice(i, i + LOTE_MAX);

      for (const id of chunk) {
        const docRef = db.collection(coleccion).doc(id);
        // Eliminar campos nulos para mantener Firestore limpio
        const registro = Object.fromEntries(
          Object.entries(registros[id]).filter(([_, v]) => v !== null && v !== undefined)
        );
        lote.set(docRef, registro);
      }

      await lote.commit();
      console.log(`   ✅ Lote ${Math.floor(i / LOTE_MAX) + 1} importado (${chunk.length} documentos)`);
    }
  }

  console.log("\n✅ Importación completa. Revisa tu Firestore en la consola de Firebase.");
  process.exit(0);
}

importar().catch((err) => {
  console.error("\n❌ Error durante la importación:", err.message);
  process.exit(1);
});
