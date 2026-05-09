const { seedUsers } = require('./seed-users');
const { seedDiagnostics } = require('./seed-diagnostics');

async function runAllTests() {
  console.log(" INICIANDO PRUEBAS DE SISTEMA (SEEDING)\n");
  
  try {
    await seedUsers();
    await seedDiagnostics();
    console.log("✨TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE");
    console.log(" Revisa tu Admin Dashboard para ver los cambios en tiempo real.");
  } catch (error) {
    console.error(" ERROR DURANTE LA EJECUCIÓN DE PRUEBAS:", error);
  }
}

runAllTests().then(() => {
  console.log("\nPresiona Ctrl+C para salir si el proceso no termina.");
});
