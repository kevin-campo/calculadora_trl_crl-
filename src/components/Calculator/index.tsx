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
      "Producto/sistema integrado a escala de laboratorio demuestra rendimiento." ,
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
  const [answers, setAnswers] = useState<Record<string, number | null>>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("trl_answers") : null;
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const initial: Record<string, number | null> = {};
    QUESTIONS.forEach((q) => (initial[q.id] = null));
    return initial;
  });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("trl_answers", JSON.stringify(answers));
    } catch (e) {}
  }, [answers]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("trl_profile") : null;
      if (raw) setProfile(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("trl_profile", JSON.stringify(profile));
    } catch (e) {}
  }, [profile]);

  const handleAnswer = (id: string, v: number) => {
    setAnswers((s) => ({ ...s, [id]: v }));
  };

  const reset = () => {
    setProfile({ org: "", title: "", description: "" });
    const initial: Record<string, number | null> = {};
    QUESTIONS.forEach((q) => (initial[q.id] = null));
    setAnswers(initial);
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

  return (
    <section id="calculator" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-black">Calculadora de Madurez Tecnológica y Comercial</h2>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-bold mb-1 text-black">Nombre de la organización</label>
            <input
              value={profile.org}
              onChange={(e) => setProfile((p) => ({ ...p, org: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-black font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 text-black">Título de la propuesta</label>
            <input
              value={profile.title}
              onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-black font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 text-black">Descripción del producto/innovación</label>
            <input
              value={profile.description}
              onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-black font-medium"
            />
          </div>
        </div>

        <div>
          {QUESTIONS.map((q) => (
            <Question
              key={q.id}
              id={q.id}
              title={q.title}
              options={q.options}
              value={answers[q.id] ?? null}
              onChange={(v) => handleAnswer(q.id, v)}
            />
          ))}
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4 items-center">
          <div>
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Borrar respuestas
            </button>
            <button
              onClick={downloadCSV}
              className="ml-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Exportar CSV
            </button>
          </div>

          <div className="text-sm text-gray-700">
            <div><strong>Resumen:</strong></div>
            <div>Organización: {profile.org || "-"}</div>
            <div>Propuesta: {profile.title || "-"}</div>
            <div>Preguntas respondidas: {Object.values(answers).filter(Boolean).length} / {QUESTIONS.length}</div>
          </div>
        </div>

        <Results profile={profile} answers={answers} questions={QUESTIONS} />
      </div>
    </section>
  );
};

export default Calculator;
