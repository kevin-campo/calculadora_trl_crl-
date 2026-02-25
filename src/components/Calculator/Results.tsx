"use client";
import React, { useRef, useState } from "react";
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
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPDF = async () => {
    if (!resultsRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = resultsRef.current;

      const opt: any = {
        margin: [10, 10, 10, 10],
        filename: `${profile.org?.replace(/\s+/g, '_') || "Diagnostico"}_TRL_CRL.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          onclone: (clonedDoc: Document) => {
            // ELIMINAR TODOS LOS ESTILOS EXISTENTES (Esto evita el error de parseo de 'lab' / 'oklch')
            const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach(s => s.remove());

            // INYECTAR CSS SEGURO (Solo HEX y RGB estándar)
            const safeStyle = clonedDoc.createElement('style');
            safeStyle.innerHTML = `
              * { box-sizing: border-box; font-family: sans-serif; }
              #results-content { 
                width: 850px !important; 
                padding: 40px !important; 
                background: #ffffff !important; 
                color: #1a1a1a !important; 
              }
              header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
              header h3 { color: #1e3a8a; margin: 0; font-size: 28px; }
              header p { color: #666; margin: 5px 0 0; }
              
              .grid { display: flex; gap: 20px; width: 100%; margin-bottom: 30px; }
              .grid > div { 
                flex: 1; 
                padding: 20px; 
                border-radius: 12px; 
                border: 1px solid #e5e7eb; 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
              }
              .bg-\\[\\#f0f7ff\\] { background-color: #f0f7ff !important; border-color: #dbeafe !important; }
              .bg-\\[\\#f0fdf4\\] { background-color: #f0fdf4 !important; border-color: #dcfce7 !important; }
              .text-blue-900 { color: #1e3a8a !important; }
              .text-blue-600 { color: #2563eb !important; }
              .text-green-600 { color: #16a34a !important; }
              
              .h-16.w-16 { 
                width: 60px; height: 60px; 
                background: #2563eb; color: #fff; 
                display: flex; align-items: center; justify-content: center; 
                border-radius: 12px; font-weight: bold; font-size: 24px; 
              }
              .bg-green-600 { background: #16a34a !important; }

              #results-content > div:nth-child(3) { 
                background: #f9fafb !important; padding: 30px; border: 1px solid #eee; border-radius: 16px; 
                text-align: center; margin-bottom: 30px;
              }

              .recharts-responsive-container { width: 750px !important; height: 500px !important; display: block !important; margin: 20px auto !important; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #e5e7eb; }
              th { background: #f9fafb; padding: 12px; text-align: left; font-size: 13px; font-weight: bold; border-bottom: 2px solid #e5e7eb; }
              td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 12px; line-height: 1.5; }
              
              footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; text-align: center; }
              footer p { margin: 2px 0; color: #999; }
            `;
            clonedDoc.head.appendChild(safeStyle);

            // Asegurar visibilidad del radar en el clon
            const chartDiv = clonedDoc.querySelector('.recharts-responsive-container') as HTMLElement;
            if (chartDiv) {
              chartDiv.style.display = 'block';
              chartDiv.style.visibility = 'visible';
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();

    } catch (error: any) {
      console.error("Error al generar PDF:", error);
      alert("Para una mejor calidad y evitar errores de compatibilidad, usaremos el asistente de impresión del sistema. \n\nPor favor, selecciona 'Guardar como PDF' en el destino.");
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex flex-wrap justify-end gap-3 print:hidden">
        <button
          onClick={downloadPDF}
          disabled={isDownloading}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95 text-sm disabled:opacity-70"
        >
          {isDownloading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
          {isDownloading ? "Generando..." : "Descarga Directa PDF"}
        </button>

        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 shadow-lg shadow-gray-200 transition-all flex items-center gap-2 active:scale-95 text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir / Guardar como...
        </button>
      </div>

      <div
        ref={resultsRef}
        id="results-content"
        className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-10 border border-gray-100 text-gray-900 print:shadow-none print:border-none print:p-0"
      >

        <header className="text-center space-y-2 border-b pb-8">
          <h3 className="text-3xl font-extrabold text-blue-900">Resultados del Diagnóstico</h3>
          <p className="text-gray-500 font-medium">Análisis detallado de madurez técnica y comercial</p>
        </header>

        {/* Niveles de Madurez */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#f0f7ff] rounded-2xl p-6 border border-blue-100 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Tecnológica</span>
              <h4 className="font-bold text-lg text-blue-900">Nivel TRL</h4>
              <p className="text-sm text-blue-800 font-medium leading-tight max-w-[200px]">
                {tecFilled ? `Nivel ${tecAvg} — ${getLevelLabel(tecAvg, "trl")}` : "Pendiente"}
              </p>
            </div>
            <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-lg shadow-blue-200">
              {tecFilled ? tecAvg : "-"}
            </div>
          </div>

          <div className="bg-[#f0fdf4] rounded-2xl p-6 border border-green-100 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Comercial</span>
              <h4 className="font-bold text-lg text-green-900">Nivel CLR</h4>
              <p className="text-sm text-green-800 font-medium leading-tight max-w-[200px]">
                {comFilled ? `Nivel ${comAvg} — ${getLevelLabel(comAvg, "clr")}` : "Pendiente"}
              </p>
            </div>
            <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-green-600 text-white font-black text-2xl shadow-lg shadow-green-200">
              {comFilled ? comAvg : "-"}
            </div>
          </div>
        </div>

        {/* Resumen Total Circular / Card */}
        <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 -mr-16 -mt-16 rounded-full opacity-50 transition-transform group-hover:scale-110"></div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Puntaje Global</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-6xl font-black text-gray-900">{total}</span>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-400">/ {max} PTS</p>
              <p className="text-2xl font-black text-blue-600">{pct}%</p>
            </div>
          </div>
        </div>

        {/* Gráfico Radar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-8 flex flex-col items-center">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Radar de Madurez</h4>
          <div className="w-full h-[400px] md:h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} />
                <Radar
                  name="Madurez"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de Respuestas Estilizada */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Detalle de Respuestas</h4>
          <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Categoría</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Diagnóstico Seleccionado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {questions.map((q) => {
                  const val = answers[q.id];
                  const text = val ? q.options[val - 1] : "-";
                  return (
                    <tr key={q.id} className="hover:bg-[#f0f7ff] transition-colors">
                      <td className="px-6 py-4 font-bold text-sm text-gray-800">{q.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 leading-relaxed">{text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer del Informe */}
        <footer className="pt-8 border-t text-center space-y-2">
          <p className="text-sm font-bold text-blue-900">{profile.title || "Proyecto Diagnóstico"}</p>
          <p className="text-xs text-gray-400">Generado el {new Date().toLocaleDateString()} por TRL-CRL Analyzer</p>
        </footer>
      </div>
    </div>
  );
};

export default Results;
