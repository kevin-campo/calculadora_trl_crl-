"use client";
import React, { useRef } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type Props = {
  profile: { org: string; title: string; description: string };
  answers: Record<string, number | null>;
  questions: Array<{ id: string; title: string; options: string[] }>;
};

const Results: React.FC<Props> = ({ profile, answers, questions }) => {
  const radarData = questions.map((q) => ({
    category: q.title,
    value: answers[q.id] ?? 0,
    fullMark: 5,
  }));

  const total = Object.values(answers)
    .map((v) => v ?? 0)
    .reduce((a, b) => a + b, 0);
  const max = questions.length * 5;
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;

  // Separar en tecnológica y comercial (primeras 4 y últimas 3)
  const tecAnswers = [
    answers["tecnologia"],
    answers["desarrollo"],
    answers["diseno"],
    answers["competitivo"]
  ];
  const tecFilled = tecAnswers.every(a => a !== null && a !== undefined);
  const tecTotal = tecAnswers.reduce((sum, val) => sum + (val ?? 0), 0);
  const tecAvg = tecFilled ? Math.round(tecTotal / 4) : 0;

  const comAnswers = [
    answers["equipo"],
    answers["mercado"],
    answers["cadena"]
  ];
  const comFilled = comAnswers.every(a => a !== null && a !== undefined);
  const comTotal = comAnswers.reduce((sum, val) => sum + (val ?? 0), 0);
  const comAvg = comFilled ? Math.round(comTotal / 3) : 0;

  // Etiquetas descriptivas según nivel
  const getLevelLabel = (val: number, type: "trl" | "clr") => {
    const trlLabels: Record<number, string> = {
      1: "Observación / Idea",
      2: "Concepto demostrado",
      3: "Validación inicial",
      4: "Demostración piloto",
      5: "Listo para comercialización",
    };
    const clrLabels: Record<number, string> = {
      1: "No preparado comercialmente",
      2: "Estrategia inicial",
      3: "Prueba de mercado",
      4: "Preparado para escala",
      5: "Listo para mercado masivo",
    };
    return type === "trl" ? trlLabels[val] || "" : clrLabels[val] || "";
  };

  const resultsRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!resultsRef.current) return;

    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`${profile.org || "resultado"}-TRL-diagnostico.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error al generar el PDF. Intenta de nuevo.");
    }
  };

  return (
    <div className="mt-12 space-y-4">
      <div className="flex justify-end gap-3">
        <button
          onClick={downloadPDF}
          className="px-6 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 flex items-center gap-2"
        >
          📄 Descargar PDF
        </button>
      </div>
      <div ref={resultsRef} className="bg-white rounded-lg shadow-lg p-8 space-y-8">
      <h3 className="text-2xl font-bold">Resultados del Diagnóstico</h3>

      {/* Niveles de Madurez */}
      <div className="space-y-3">
        <div className="bg-yellow-200 border-2 border-black p-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">Nivel de madurez tecnológica — TRL</div>
            <div className="text-sm text-black/80">
              {tecFilled ? `Nivel ${tecAvg} — ${getLevelLabel(tecAvg, "trl")}` : "Responde las 4 categorías tecnológicas para calcular"}
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-white font-bold text-lg">
            {tecFilled ? tecAvg : "-"}
          </div>
        </div>

        <div className="bg-yellow-200 border-2 border-black p-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">Nivel de madurez comercial — CLR</div>
            <div className="text-sm text-black/80">
              {comFilled ? `Nivel ${comAvg} — ${getLevelLabel(comAvg, "clr")}` : "Responde las 3 categorías comerciales para calcular"}
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-white font-bold text-lg">
            {comFilled ? comAvg : "-"}
          </div>
        </div>
      </div>

      {/* Tabla de Respuestas */}
      <div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-300 border-2 border-black">
              <th className="border border-black p-3 text-left font-semibold">Categoría</th>
              <th className="border border-black p-3 text-left font-semibold">Respuesta</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => {
              const val = answers[q.id];
              const text = val ? q.options[val - 1] : "-";
              return (
                <tr key={q.id} className="border-2 border-black">
                  <td className="border border-black p-3 font-semibold">{q.title}</td>
                  <td className="border border-black p-3 text-sm">{text}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Gráfico Radar */}
      <div className="border-2 border-black p-6">
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart data={radarData} margin={{ top: 40, right: 120, left: 120, bottom: 40 }}>
              <PolarGrid stroke="#ddd" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fontSize: 11 }}
                angle={0}
                orientation="inner"
              />
              <PolarRadiusAxis angle={0} domain={[0, 5]} tick={{ fontSize: 10 }} />
              <Radar
                name="Nivel de Madurez"
                dataKey="value"
                stroke="#4A6CF7"
                fill="#4A6CF7"
                fillOpacity={0.6}
              />
              <Legend />
              <Tooltip formatter={(value) => `Nivel ${value}`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumen Total */}
      <div className="border-2 border-black p-6 text-center">
        <p className="text-sm font-bold text-black mb-2">Puntaje Total</p>
        <p className="text-4xl font-bold text-black mb-2">
          {total} / {max}</p>
        <p className="text-xl text-black font-bold">{pct}%</p>
      </div>
      </div>
    </div>
  );
};

export default Results;
