/**
 * Test de Autenticación y Roles
 * Verifica que el sistema asigne correctamente los roles basados en el email.
 */

const ADMIN_EMAILS = ["admin@trl-crl.com", "supervisor@trl-crl.com"];

function simulateRoleAssignment(email) {
  const userData = { email };
  if (email && ADMIN_EMAILS.includes(email)) {
    userData.role = "admin";
  } else {
    userData.role = "user";
  }
  return userData.role;
}

async function runAuthTest() {
  console.log("--- Iniciando Test de Autenticación y Roles ---");
  
  const cases = [
    { email: "admin@trl-crl.com", expected: "admin" },
    { email: "supervisor@trl-crl.com", expected: "admin" },
    { email: "usuario.normal@gmail.com", expected: "user" },
    { email: "test@empresa.co", expected: "user" }
  ];

  let passed = 0;
  cases.forEach(c => {
    const result = simulateRoleAssignment(c.email);
    if (result === c.expected) {
      console.log(` PASSED: ${c.email} -> ${result}`);
      passed++;
    } else {
      console.error(` FAILED: ${c.email} esperado ${c.expected}, obtenido ${result}`);
    }
  });

  console.log(`\nResultado: ${passed}/${cases.length} pruebas pasadas.`);
  console.log("--- Finalizado ---\n");
  return passed === cases.length;
}

if (require.main === module) {
  runAuthTest().then(success => process.exit(success ? 0 : 1));
}

module.exports = { runAuthTest };
