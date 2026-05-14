const { userActions } = require('../backend/crud.js');

async function checkDuplicateUsers() {
  try {
    console.log("🔍 Buscando usuarios duplicados en la base de datos...\n");
    
    const users = await userActions.getAll();
    console.log(`📊 Total de usuarios encontrados: ${users.length}\n`);

    // Crear mapa de emails para detectar duplicados
    const emailMap = new Map();
    const duplicates = [];

    users.forEach(user => {
      if (user.email) {
        if (emailMap.has(user.email)) {
          // Email duplicado encontrado
          const existing = emailMap.get(user.email);
          duplicates.push({
            email: user.email,
            users: [
              { uid: existing.id, provider: existing.provider, name: existing.name },
              { uid: user.id, provider: user.provider, name: user.name }
            ]
          });
        } else {
          emailMap.set(user.email, user);
        }
      }
    });

    if (duplicates.length === 0) {
      console.log("✅ No se encontraron usuarios duplicados por correo electrónico.\n");
    } else {
      console.log(`⚠️  Se encontraron ${duplicates.length} correo(s) duplicado(s):\n`);
      duplicates.forEach((dup, index) => {
        console.log(`${index + 1}. Email: ${dup.email}`);
        console.log(`   Usuario 1: UID=${dup.users[0].uid}, Provider=${dup.users[0].provider}, Name=${dup.users[0].name}`);
        console.log(`   Usuario 2: UID=${dup.users[1].uid}, Provider=${dup.users[1].provider}, Name=${dup.users[1].name}\n`);
      });
    }

    // Mostrar estadísticas por provider
    const providerStats = {};
    users.forEach(user => {
      const provider = user.provider || 'unknown';
      providerStats[provider] = (providerStats[provider] || 0) + 1;
    });
    
    console.log("📈 Usuarios por método de autenticación:");
    Object.entries(providerStats).forEach(([provider, count]) => {
      console.log(`   - ${provider}: ${count} usuario(s)`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al verificar duplicados:", error);
    process.exit(1);
  }
}

checkDuplicateUsers();
