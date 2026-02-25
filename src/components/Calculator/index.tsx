"use client";
import React, { useState, useEffect } from "react";
import Question from "./Question";
import Results from "./Results";

const QUESTIONS = [
  {
    id: "tecnologia",
    title: "Tecnología",
    options: [
      "El proyecto va más allá de la investigación básica y se ha definido el concepto de tecnología.",
      "Comenzó la investigación aplicada y se han identificado las aplicaciones prácticas.",
      "Pruebas preliminares de los componentes de la tecnología en laboratorio.",
      "Prueba inicial del producto/sistema en entorno de laboratorio.",
      "Producto/sistema integrado a escala de laboratorio demuestra rendimiento.",
    ],
  },
  {
    id: "desarrollo",
    title: "Desarrollo de productos",
    options: [
      "Se ha definido preliminarmente el match entre el producto / mercado",
      "Se ha probado el producto a escala piloto en las aplicaciones previstas",
      "Demostración de prototipo a escala completa en la(s) aplicación(es) prevista(s)",
      "Producto funciona en su forma casi final bajo condiciones representativas",
      "Producto en su forma final y operando bajo condiciones completas",
    ],
  },
  {
    id: "diseno",
    title: "Definición de Producto / Diseño",
    options: [
      "Hipótesis de producto inicial para segmento definido.",
      "Propuesta de valor clara y validación MVP.",
      "Producto escalado a piloto y problemas identificados.",
      "Modelo integral de propuesta de valor y especificaciones de diseño.",
      "Optimización y certificaciones para salida a venta.",
    ],
  },
  {
    id: "competitivo",
    title: "Entorno competitivo",
    options: [
      "Investigación de mercado preliminar por fuentes secundarias.",
      "Investigación de mercado para demostrar viabilidad comercial.",
      "Investigación primaria exhaustiva para demostrar viabilidad comercial.",
      "Análisis comparativo para ilustrar características y ventajas.",
      "Comprensión total y completa del entorno competitivo.",
    ],
  },
  {
    id: "equipo",
    title: "Equipo",
    options: [
      "No se tiene un equipo o grupo de investigación o emprendimiento conformado.",
      "Dirigen el grupo de investigación profesores/investigadores.",
      "Grupo con asistencia de asesores/mentores externos.",
      "Equipo interdisciplinario con experiencia técnica y de negocio.",
      "Equipo equilibrado con todas las capacidades a bordo.",
    ],
  },
  {
    id: "mercado",
    title: "Estrategia de entrada al mercado",
    options: [
      "Modelo de negocio inicial y propuesta de valor definidos.",
      "Entrevistas a clientes/aliados para entender necesidades.",
      "Necesidades del mercado y primeros adaptadores identificados.",
      "Relaciones iniciales con adaptadores tempranos desarrolladas.",
      "Acuerdos de suministro y pedidos iniciales recibidos.",
    ],
  },
  {
    id: "cadena",
    title: "Fabricación / Cadena de suministro",
    options: [
      "Posibles proveedores, aliados y clientes mapeados.",
      "Relaciones con proveedores y 'adaptadores tempranos' establecidas.",
      "Calificaciones del proceso de fabricación en progreso.",
      "Productos/sistemas fabricados por piloto y vendidos a clientes iniciales.",
      "Fabricación a gran escala y despliegue generalizado logrado.",
    ],
  },
];

const Calculator: React.FC = () => {
  const [profile, setProfile] = useState({ org: "", title: "", description: "" });
  const [currentStep, setCurrentStep] = useState(0); // 0: Profile, 1-N: Questions, N+1: Summary/Results
  const [answers, setAnswers] = useState<Record<string, number | null>>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("trl_answers") : null;
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    const initial: Record<string, number | null> = {};
    QUESTIONS.forEach((q) => (initial[q.id] = null));
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem("trl_answers", JSON.stringify(answers));
    } catch (e) { }
  }, [answers]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("trl_profile") : null;
      if (raw) setProfile(JSON.parse(raw));
    } catch (e) { }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("trl_profile", JSON.stringify(profile));
    } catch (e) { }
  }, [profile]);

  const handleAnswer = (id: string, v: number) => {
    setAnswers((s) => ({ ...s, [id]: v }));
  };

  const reset = () => {
    if (confirm("¿Estás seguro de que quieres borrar todas las respuestas?")) {
      setProfile({ org: "", title: "", description: "" });
      const initial: Record<string, number | null> = {};
      QUESTIONS.forEach((q) => (initial[q.id] = null));
      setAnswers(initial);
      setCurrentStep(0);
    }
  };

  const calculate = () => {
    const vals = Object.values(answers).map((v) => v ?? 0);
    const total = vals.reduce((a, b) => a + b, 0);
    const max = QUESTIONS.length * 5;
    const pct = max > 0 ? Math.round((total / max) * 100) : 0;
    return { total, max, pct };
  };

  const downloadCSV = () => {
    const rows: string[][] = [];
    rows.push(["Pregunta", "Selección (1-5)", "Texto respuesta"]);
    QUESTIONS.forEach((q) => {
      const v = answers[q.id] ?? "";
      const text = v ? q.options[v - 1] : "";
      rows.push([q.title, String(v), text.replace(/\n/g, " ")]);
    });
    const summary = calculate();
    rows.push(["Total", String(summary.total), `Porcentaje: ${summary.pct}%`]);
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.org || "resultado"}-trl.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const nextStep = () => {
    if (currentStep < QUESTIONS.length + 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const totalSteps = QUESTIONS.length + 1; // Profile + Questions
  const progress = (currentStep / totalSteps) * 100;

  return (
    <section id="calculator" className="py-16 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">
            Diagnóstico de Madurez (TRL)
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Evalúa el estado actual de tu proyecto en múltiples dimensiones tecnológicas y comerciales.
          </p>
        </div>

        {/* Barra de Progreso */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold text-blue-600">
              Paso {currentStep} de {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-500">
              {Math.round(progress)}% completado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Contenido Dinámico */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100 min-h-[400px] flex flex-col justify-between">

          {currentStep === 0 && (
            <div className="animate-fadeIn">
              <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Información del Proyecto</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 font-medium">Nombre de la organización</label>
                  <input
                    placeholder="Ej. Mi Startup S.A."
                    value={profile.org}
                    onChange={(e) => setProfile((p) => ({ ...p, org: e.target.value }))}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 font-medium">Título de la propuesta</label>
                  <input
                    placeholder="Ej. Sistema de Purificación de Agua"
                    value={profile.title}
                    onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 font-medium">Descripción del producto/innovación</label>
                  <textarea
                    rows={4}
                    placeholder="Escribe una breve descripción..."
                    value={profile.description}
                    onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors text-black"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep > 0 && currentStep <= QUESTIONS.length && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">CATEGORÍA</span>
                <h3 className="text-xl font-bold text-gray-800">{QUESTIONS[currentStep - 1].title}</h3>
              </div>
              <Question
                key={QUESTIONS[currentStep - 1].id}
                id={QUESTIONS[currentStep - 1].id}
                title={QUESTIONS[currentStep - 1].title}
                options={QUESTIONS[currentStep - 1].options}
                value={answers[QUESTIONS[currentStep - 1].id] ?? null}
                onChange={(v) => handleAnswer(QUESTIONS[currentStep - 1].id, v)}
              />
            </div>
          )}

          {currentStep === QUESTIONS.length + 1 && (
            <div className="animate-fadeIn">
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Diagnóstico Completado!</h3>
                <p className="text-gray-600 mb-8">Has respondido todas las dimensiones. Revisa tus resultados a continuación.</p>

                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={downloadCSV}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                  >
                    Descargar CSV
                  </button>
                  <button
                    onClick={reset}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                  >
                    Reiniciar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="mt-10 flex items-center justify-between border-t pt-6">
            <button
              disabled={currentStep === 0}
              onClick={prevStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100 active:scale-95"
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            {currentStep < QUESTIONS.length + 1 && (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                {currentStep === QUESTIONS.length ? "Ver Resultados" : "Siguiente"}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Sección de Resultados Finales (Siempre visible o condicional al final) */}
        {currentStep === QUESTIONS.length + 1 && (
          <div className="mt-12 animate-fadeInUp">
            <Results profile={profile} answers={answers} questions={QUESTIONS} />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default Calculator;
