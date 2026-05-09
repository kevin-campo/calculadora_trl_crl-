const { seedUsers } = require('./seed-users');
const { seedDiagnostics } = require('./seed-diagnostics');
const { runAuthTest } = require('./auth-roles.test');
const { runCalculatorTest } = require('./calculator-logic.test');

async function runAllTests() {
  console.log(" INICIANDO PRUEBAS DE SISTEMA (VALIDACIÓN Y SEEDING)\n");
  
  try {
    // 1. Validaciones Lógicas
    await runAuthTest();
    await runCalculatorTest();

    // 2. Carga de Datos (Seeding)
    await seedUsers();
    await seedDiagnostics();
    
    console.log(" TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE");
    console.log(" Revisa tu Admin Dashboard para ver los cambios en tiempo real.");
  } catch (error) {
    console.error(" ERROR DURANTE LA EJECUCIÓN DE PRUEBAS:", error);
  }
}

runAllTests().then(() => {
  console.log("\nPresiona Ctrl+C para salir si el proceso no termina.");
});
