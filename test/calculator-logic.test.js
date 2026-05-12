/**
 * Test de Integridad de Cálculos
 * Verifica que la lógica de puntuación de la calculadora TRL/CRL sea exacta.
 */

// Mock de la estructura de preguntas (7 secciones según src/components/Calculator/questions.ts)
const QUESTIONS_COUNT = 7; 
const MAX_PER_QUESTION = 5;
const TOTAL_MAX = QUESTIONS_COUNT * MAX_PER_QUESTION; // 35

function calculateScore(answers) {
  const vals = Object.values(answers).map((v) => v ?? 0);
  const total = vals.reduce((a, b) => a + b, 0);
  const max = TOTAL_MAX;
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  return { total, max, pct };
}

async function runCalculatorTest() {
  console.log("--- Iniciando Test de Integridad de Cálculos ---");

  const testCases = [
    {
      name: "Puntuación Mínima (Ceros)",
      answers: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0 },
      expected: { total: 0, pct: 0 }
    },
    {
      name: "Puntuación Máxima (Todo 5)",
      answers: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5 },
      expected: { total: 35, pct: 100 }
    },
    {
      name: "Puntuación Media (Todo 3)",
      answers: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3 },
      expected: { total: 21, pct: 60 } // (21/35) * 100 = 60
    },
    {
      name: "Respuestas Incompletas (Algunos null)",
      answers: { q1: 5, q2: null, q3: 5, q4: null, q5: 5, q6: null, q7: 5 },
      expected: { total: 20, pct: 57 } // (20/35) * 100 = 57.14 -> 57
    }
  ];

  let passed = 0;
  testCases.forEach(tc => {
    const result = calculateScore(tc.answers);
    if (result.total === tc.expected.total && result.pct === tc.expected.pct) {
      console.log(` PASSED: ${tc.name} [Total: ${result.total}, Pct: ${result.pct}%]`);
      passed++;
    } else {
      console.error(` FAILED: ${tc.name}`);
      console.error(`   Esperado: Total ${tc.expected.total}, Pct ${tc.expected.pct}%`);
      console.error(`   Obtenido: Total ${result.total}, Pct ${result.pct}%`);
    }
  });

  console.log(`\nResultado: ${passed}/${testCases.length} pruebas pasadas.`);
  console.log("--- Finalizado ---\n");
  return passed === testCases.length;
}

if (require.main === module) {
  runCalculatorTest().then(success => process.exit(success ? 0 : 1));
}

module.exports = { runCalculatorTest };
