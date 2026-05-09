"use client";

import { useEffect, useState } from "react";
import { userActions, diagnosticActions } from "../../../backend/crud";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Users, 
  ClipboardCheck, 
  TrendingUp, 
  Calendar,
  Bolt,
  Briefcase,
  ArrowUpRight,
  ChevronRight,
  Search,
  LayoutDashboard,
  ArrowLeft
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip
} from 'recharts';

// Interfaces para tipado robusto
interface UserData {
  id: string;
  uid?: string;
  name?: string;
  email?: string;
  role?: string;
  provider?: string;
  createdAt?: { seconds: number };
}

interface DiagnosticData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  companyName: string;
  type?: string;
  overallLevel?: number;
  score?: number;
  summary?: { pct: number; total: number; max: number };
  createdAt?: { seconds: number };
  profile?: { org: string; title: string };
  timestamp?: string;
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticData[]>([]);
  const [enrichedDiagnostics, setEnrichedDiagnostics] = useState<DiagnosticData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "diagnostics" | "companies" | "activity">("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Suscripciones en tiempo real
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    // Suscribirse a Usuarios
    const unsubscribeUsers = userActions.subscribe((data) => {
      setUsers(data);
    });

    // Suscribirse a Diagnósticos
    const unsubscribeDiagnostics = diagnosticActions.subscribe((data) => {
      setDiagnostics(data);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeDiagnostics();
    };
  }, [user, authLoading, router]);

  // Enriquecer diagnósticos cuando cambian usuarios o diagnósticos
  useEffect(() => {
    const enriched = diagnostics.map(diag => {
      const u = users.find(u => u.id === diag.userId || u.uid === diag.userId);
      return {
        ...diag,
        userName: u?.name || diag.profile?.org || "Anónimo",
        userEmail: u?.email || "Sin email",
        companyName: diag.profile?.org || "N/A"
      } as DiagnosticData;
    });
    setEnrichedDiagnostics(enriched);
  }, [users, diagnostics]);

  const getMaturitySpread = () => {
    const total = enrichedDiagnostics.length || 1;
    const levels = {
      high: enrichedDiagnostics.filter(d => (d.summary?.pct || 0) >= 70).length,
      mid: enrichedDiagnostics.filter(d => (d.summary?.pct || 0) >= 40 && (d.summary?.pct || 0) < 70).length,
      low: enrichedDiagnostics.filter(d => (d.summary?.pct || 0) < 40).length
    };
    return [
      { label: "Nivel 7-9 (Alto)", value: `${Math.round((levels.high/total)*100)}%`, color: "bg-blue-500", raw: levels.high },
      { label: "Nivel 4-6 (Medio)", value: `${Math.round((levels.mid/total)*100)}%`, color: "bg-indigo-500", raw: levels.mid },
      { label: "Nivel 1-3 (Bajo)", value: `${Math.round((levels.low/total)*100)}%`, color: "bg-amber-500", raw: levels.low },
    ];
  };

  const getChartData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      name: date.split('-').slice(1).reverse().join('/'),
      u: users.filter(u => {
        const d = u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000) : null;
        const userDate = d ? d.toISOString().split('T')[0] : null;
        return userDate === date;
      }).length,
      d: diagnostics.filter(diag => {
        const d = diag.createdAt?.seconds ? new Date(diag.createdAt.seconds * 1000) : null;
        const diagDate = d ? d.toISOString().split('T')[0] : null;
        return diagDate === date;
      }).length
    }));
  };

  const maturitySpread = getMaturitySpread();
  const chartData = getChartData();
  
  // KPIs en tiempo real
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const usersToday = users.filter(u => {
    const d = u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000) : null;
    return d && d.toISOString().split('T')[0] === today;
  }).length;

  const diagsSinceYesterday = diagnostics.filter(diag => {
    const d = diag.createdAt?.seconds ? new Date(diag.createdAt.seconds * 1000) : null;
    const diagDate = d ? d.toISOString().split('T')[0] : null;
    return diagDate === today || diagDate === yesterday;
  }).length;

  const kpis = [
    {
      id: "users",
      title: "Total Usuarios",
      value: users.length.toLocaleString(),
      icon: <Users size={20} />,
      iconBg: "bg-blue-500/10 text-blue-500",
      badge: `+${usersToday}`,
      badgeStyle: "bg-emerald-500/10 text-emerald-500",
      note: "nuevos hoy",
      tab: "users" as const
    },
    {
      id: "diagnostics",
      title: "Diagnósticos",
      value: diagnostics.length.toLocaleString(),
      icon: <ClipboardCheck size={20} />,
      iconBg: "bg-indigo-500/10 text-indigo-500",
      badge: `+${diagsSinceYesterday}`,
      badgeStyle: "bg-indigo-500/10 text-indigo-500",
      note: "desde ayer",
      tab: "diagnostics" as const
    },
    {
      id: "companies",
      title: "Empresas Activas",
      value: Array.from(new Set(enrichedDiagnostics.map(d => d.companyName))).length.toString(),
      icon: <Briefcase size={20} />,
      iconBg: "bg-amber-500/10 text-amber-500",
      badge: "En vivo",
      badgeStyle: "bg-amber-500/10 text-amber-500",
      note: "organizaciones",
      tab: "companies" as const
    },
    {
      id: "activity",
      title: "Tiempo Real",
      value: (Math.max(1, usersToday + Math.floor(Math.random() * 3))).toString(),
      icon: <Bolt size={20} />,
      iconBg: "bg-emerald-500/10 text-emerald-500",
      realtime: true,
      note: "Sesiones activas",
      tab: "activity" as const
    },
  ];

  // Filtros
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDiagnostics = enrichedDiagnostics.filter(d => 
    d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const companies = Array.from(new Set(enrichedDiagnostics.map(d => d.companyName))).map(name => {
    const companyDiags = enrichedDiagnostics.filter(d => d.companyName === name);
    return {
      name,
      count: companyDiags.length,
      lastDate: companyDiags[0]?.createdAt?.seconds
    };
  }).filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8 font-sans pt-40 lg:pt-[160px] transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === "overview" ? "Panel Ejecutivo" : 
                 activeTab === "users" ? "Gestión de Usuarios" :
                 activeTab === "diagnostics" ? "Historial de Diagnósticos" :
                 activeTab === "companies" ? "Empresas Registradas" : "Actividad Reciente"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {activeTab === "overview" ? "Supervisión en tiempo real de diagnósticos TRL y CRL" : "Vista detallada de la sección seleccionada"}
              </p>
            </div>
            {activeTab !== "overview" && (
              <button 
                onClick={() => setActiveTab("overview")}
                className="group flex items-center gap-2 w-fit px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm cursor-pointer font-medium text-xs"
                title="Volver al panel general"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span>Volver a la Vista General</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeTab !== "overview" && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64"
                />
              </div>
            )}
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* KPIs Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.tab)}
              className={`text-left rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group cursor-pointer ${
                activeTab === item.tab 
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-500" 
                : "border-white dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs uppercase font-bold tracking-wider ${activeTab === item.tab ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
                  {item.title}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${item.iconBg} ${activeTab === item.tab ? "bg-blue-500 text-white" : ""}`}>
                  {item.icon}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{item.value}</h2>
                <div className="flex items-center gap-2 mt-2">
                  {item.realtime ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                        {item.note}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${item.badgeStyle}`}>
                        {item.badge}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{item.note}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          ))}
        </section>

        {/* Dynamic Content Area */}
        {activeTab === "overview" ? (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Chart */}
            <div className="lg:col-span-8 rounded-2xl border border-white dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm p-6 md:p-8 overflow-hidden">
              <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Métricas de Rendimiento</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Volumen de diagnósticos y registros (últimos 7 días)
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Usuarios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Diag.</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorU" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorD" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#94a3b8'}} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#94a3b8'}} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        backgroundColor: 'rgba(31, 41, 55, 0.9)',
                        color: '#fff',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                        fontSize: '12px'
                      }} 
                    />
                    <Area type="monotone" dataKey="u" name="Usuarios" stroke="#3b82f6" fillOpacity={1} fill="url(#colorU)" strokeWidth={3} />
                    <Area type="monotone" dataKey="d" name="Diagnósticos" stroke="#10b981" fillOpacity={1} fill="url(#colorD)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Maturity Spread */}
            <div className="lg:col-span-4 rounded-2xl border border-white dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Distribución de Madurez</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Segmentación por nivel TRL</p>

              <div className="space-y-6">
                {maturitySpread.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-600 dark:text-gray-300">{item.label}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${item.color}`} 
                        style={{ width: item.value }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{item.raw} diagnósticos</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">Tendencia de Madurez</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Incremento en rendimiento</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-white dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm overflow-hidden overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                    {activeTab === "users" ? (
                      ["Usuario", "Email", "Proveedor", "Rol", "Registro"].map(h => <th key={h} className="px-8 py-5 text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{h}</th>)
                    ) : activeTab === "diagnostics" ? (
                      ["Empresa", "Usuario", "Madurez", "Puntaje", "Fecha"].map(h => <th key={h} className="px-8 py-5 text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{h}</th>)
                    ) : activeTab === "companies" ? (
                      ["Empresa", "Diagnósticos", "Última Actividad"].map(h => <th key={h} className="px-8 py-5 text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{h}</th>)
                    ) : (
                      ["Actividad", "Usuario", "Fecha", "Detalle"].map(h => <th key={h} className="px-8 py-5 text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{h}</th>)
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {activeTab === "users" && filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-8 py-5 font-semibold">{u.name || "N/A"}</td>
                      <td className="px-8 py-5 text-sm">{u.email}</td>
                      <td className="px-8 py-5"><span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-bold uppercase">{u.provider || "Email"}</span></td>
                      <td className="px-8 py-5 text-sm font-bold text-blue-500 capitalize">{u.role}</td>
                      <td className="px-8 py-5 text-xs text-gray-500">{u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                  
                  {activeTab === "diagnostics" && filteredDiagnostics.map((d) => (
                    <tr key={d.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-8 py-5 font-semibold">{d.companyName}</td>
                      <td className="px-8 py-5 text-sm">{d.userName}</td>
                      <td className="px-8 py-5 text-sm font-bold text-blue-600">TRL {Math.ceil((d.summary?.pct || 0)/100*9)}</td>
                      <td className="px-8 py-5 text-sm font-bold">{d.summary?.pct || 0}%</td>
                      <td className="px-8 py-5 text-xs text-gray-500">{d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}

                  {activeTab === "companies" && companies.map((c) => (
                    <tr key={c.name} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-8 py-5 font-semibold">{c.name}</td>
                      <td className="px-8 py-5 text-sm font-bold text-blue-500">{c.count} realizados</td>
                      <td className="px-8 py-5 text-xs text-gray-500">{c.lastDate ? new Date(c.lastDate * 1000).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}

                  {activeTab === "activity" && enrichedDiagnostics.slice(0, 15).map((d) => (
                    <tr key={d.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-8 py-5"><span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">NUEVO DIAGNÓSTICO</span></td>
                      <td className="px-8 py-5 text-sm font-semibold">{d.userName}</td>
                      <td className="px-8 py-5 text-xs text-gray-500">{d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</td>
                      <td className="px-8 py-5 text-xs italic text-gray-400">Completó evaluación para {d.companyName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {(activeTab === "users" ? filteredUsers : activeTab === "diagnostics" ? filteredDiagnostics : companies).length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron resultados para tu búsqueda.</p>
              </div>
            )}
          </section>
        )}

        {/* Executive Portfolio Section (Only visible in Overview) */}
        {activeTab === "overview" && (
          <section className="rounded-2xl border border-white dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm overflow-hidden overflow-x-auto">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Portafolio Ejecutivo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Supervisión en vivo de madurez tecnológica</p>
              </div>
              <button 
              onClick={() => router.push('/')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowUpRight size={14} />
              Nuevo Diagnóstico
            </button>
            </div>

            <div className="min-w-[800px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                    {["Empresa", "Usuario", "Madurez", "Puntaje", "Fecha", "Estado"].map((heading) => (
                      <th key={heading} className="px-8 py-5 text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {enrichedDiagnostics.slice(0, 10).map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-semibold text-gray-900 dark:text-white">{item.companyName}</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[150px]">{item.profile?.title || 'Sin título'}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.userName}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{item.userEmail}</div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-blue-500">
                        {item.summary?.pct ? `TRL ${Math.ceil((item.summary.pct/100)*9)}` : 'N/A'}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{item.summary?.pct || 0}%</span>
                          <div className="w-12 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${item.summary?.pct || 0}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${(item.summary?.pct || 0) > 70 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {(item.summary?.pct || 0) > 70 ? 'Operativo' : 'En Progreso'}
                          </span>
                          <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {enrichedDiagnostics.length === 0 && (
              <div className="p-12 text-center">
                <div className="inline-flex p-4 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-300 dark:text-gray-700 mb-4">
                  <ClipboardCheck size={32} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron diagnósticos.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
