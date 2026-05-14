"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { diagnosticActions } from "@/../backend/crud";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { 
  MessageSquare, 
  TrendingUp, 
  Calendar, 
  Building2,
  Plus,
  ArrowRight
} from "lucide-react";

const MentorshipPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDiagnoses();
    }
  }, [user]);

  const fetchDiagnoses = async () => {
    try {
      setLoading(true);
      const data = await diagnosticActions.getByUserId(user!.uid);
      setDiagnoses(data);
    } catch (error) {
      console.error("Error al cargar diagnósticos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0A0F2D]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F2D] pt-32 pb-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Acceso Denegado
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Debes iniciar sesión para ver las mentorías.
          </p>
          <Link
            href="/signin"
            className="bg-primary hover:bg-primary/90 rounded-xl px-8 py-4 text-white font-bold transition-all"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F2D] pt-32 pb-20">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <Breadcrumb 
          pageName="Mentorías" 
          description="Gestiona tus procesos de mentoría y rutas de maduración tecnológica"
        />

        {/* Hero Section */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 md:p-12 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
                Mis Mentorías
              </h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
                Accede a tus diagnósticos y procesos de mentoría para alcanzar la madurez tecnológica y comercial óptima.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl px-8 py-4 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <Plus size={20} />
              Nuevo Diagnóstico
            </Link>
          </div>
        </div>

        {/* Lista de Diagnósticos */}
        {diagnoses.length === 0 ? (
          <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-white/10 rounded-2xl mb-6">
              <MessageSquare size={40} className="text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              No tienes diagnósticos aún
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Completa un diagnóstico para comenzar tu proceso de mentoría y alcanzar la madurez tecnológica óptima.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl px-8 py-4 transition-all"
            >
              Comenzar Diagnóstico
              <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagnoses.map((diagnosis) => (
              <Link
                key={diagnosis.id}
                href={`/mentorship/${diagnosis.id}`}
                className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-6 shadow-sm hover:border-primary transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      {diagnosis.profile?.title || "Proyecto sin título"}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                      {diagnosis.profile?.org || "Sin organización"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-primary">{diagnosis.summary?.pct || 0}%</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Madurez</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(diagnosis.timestamp).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={14} />
                    TRL {Math.ceil((diagnosis.summary?.pct || 0)/100*9)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
                  <span className="text-sm font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                    Ver Mentoría
                    <ArrowRight size={16} />
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Activo</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MentorshipPage;
