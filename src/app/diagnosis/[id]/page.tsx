
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { diagnosticActions } from "@/../backend/crud";
import { useAuth } from "@/context/AuthContext";
import Results from "@/components/Calculator/Results";
import { QUESTIONS } from "@/components/Calculator/questions";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";

const DiagnosisDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDiagnosis();
    }
  }, [id]);

  const fetchDiagnosis = async () => {
    try {
      const data = await diagnosticActions.getById(id as string);
      if (!data) {
        console.error("Diagnóstico no encontrado");
        return;
      }
      setDiagnosis(data);
    } catch (error) {
      console.error("Error al obtener el diagnóstico:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="container py-20 text-center">
        <h2 className="mb-4 text-2xl font-bold">Diagnóstico no encontrado</h2>
        <Link href="/profile" className="text-primary hover:underline">
          Volver a mi perfil
        </Link>
      </div>
    );
  }

  // Verificar si el usuario tiene permiso (opcional, Firebase ya lo bloquea pero para la UI)
  if (user && diagnosis.userId !== user.uid && diagnosis.userId !== "anonymous") {
    return (
      <div className="container py-20 text-center">
        <h2 className="mb-4 text-2xl font-bold">Acceso Denegado</h2>
        <p className="mb-8">No tienes permiso para ver este diagnóstico.</p>
        <Link href="/profile" className="bg-primary px-8 py-3 text-white rounded-sm">
          Volver a mi perfil
        </Link>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName="Detalles del Diagnóstico"
        description={`Análisis detallado para el proyecto: ${diagnosis.profile?.title || 'Sin Título'}`}
      />

      <section className="pb-[120px] pt-[120px] bg-[#f8f9ff] dark:bg-gray-dark">
        <div className="container">
          <div className="mx-auto max-w-[1000px]">
            <Results
              profile={diagnosis.profile}
              answers={diagnosis.answers}
              questions={QUESTIONS}
            />

            {/* Nueva sección de Explicación Detallada */}
            <div className="mt-12 bg-white dark:bg-dark rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-white/10">
              <h3 className="text-2xl font-bold text-blue-900 dark:text-white mb-6 border-b pb-4">
                Interpretación y Roadmap
              </h3>

              <div className="space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 text-lg font-bold text-blue-700 dark:text-blue-400 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-sm">1</span>
                    Estado Actual de Madurez
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-4 border-blue-200 dark:border-blue-900 pl-4">
                    Tu proyecto presenta un nivel de madurez tecnológica de <strong>TRL {Math.round(diagnosis.summary?.pct / 20) || 'Básico'}</strong> y una madurez comercial <strong>CLR {Math.round(diagnosis.summary?.pct / 25) || 'Inicial'}</strong>. Esto indica que te encuentras en una fase de {diagnosis.summary?.pct > 70 ? 'Escalamiento y Consolidación' : diagnosis.summary?.pct > 40 ? 'Validación y Prototipado' : 'Investigación y Definición'}.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-white/5">
                  <div className="space-y-4">
                    <h5 className="font-bold text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider">Puntos Fuertes</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-green-500">✔</span> Propuesta de valor identificada.
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-green-500">✔</span> Comprensión del entorno tecnológico.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-bold text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider">Áreas de Mejora</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-amber-500">●</span> Validaciones en entornos reales con clientes.
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-amber-500">●</span> Fortalecimiento de la cadena de suministro.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-900 text-white rounded-xl p-6 mt-8">
                  <h4 className="font-bold mb-2">Recomendación Estratégica:</h4>
                  <p className="text-sm opacity-90 leading-relaxed">
                    Basado en tus respuestas, el siguiente paso crítico es <strong>{diagnosis.summary?.pct < 50 ? 'enfocarse en la protección de propiedad intelectual y prototipado mínimo' : 'estructurar acuerdos comerciales finales y certificaciones de escala'}</strong>. Te recomendamos contactar a nuestro equipo de soporte para una mentoría personalizada.
                  </p>
                  <div className="mt-4 flex gap-4">
                    <Link href={`/mentorship/${id}`} className="text-sm font-bold bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-gray-100">
                      Hablar con un mentor
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/profile" className="text-body-color hover:text-primary font-medium flex items-center justify-center gap-2 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Volver a mis diagnósticos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DiagnosisDetailPage;
