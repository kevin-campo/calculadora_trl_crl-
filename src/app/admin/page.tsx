"use client";

import { useEffect, useState } from "react";
import { userActions, diagnosticActions } from "../../../backend/crud";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { 
  Users, 
  ClipboardCheck, 
  Search, 
  TrendingUp, 
  Calendar,
  User,
  ExternalLink,
  Trash2
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  AreaChart,
  Area
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
  summary?: { pct: number };
  createdAt?: { seconds: number };
  profile?: { org: string };
  timestamp?: string;
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, diagnostics
  const [searchUser, setSearchUser] = useState("");
  const [searchDiag, setSearchDiag] = useState("");

  useEffect(() => {
    // Protección: Solo si el usuario está logueado Y tiene rol de admin
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [usersData, diagnosticsData] = await Promise.all([
          userActions.getAll(),
          diagnosticActions.getAll()
        ]);
        
        console.log("Admin Dashboard - Users fetched:", usersData.length, usersData);
        console.log("Admin Dashboard - Diagnostics fetched:", diagnosticsData.length, diagnosticsData);
        
        // Enriquecer diagnósticos con datos de usuario
        const enrichedDiagnostics = diagnosticsData.map(diag => {
          const u = usersData.find(user => user.id === diag.userId);
          return {
            ...diag,
            userName: u?.name || diag.profile?.org || "Anónimo",
            userEmail: u?.email || "Sin email",
            companyName: diag.profile?.org || "N/A"
          } as DiagnosticData;
        });

        setUsers(usersData);
        setDiagnostics(enrichedDiagnostics);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "admin") {
      fetchData();
    }
  }, [user, authLoading, router]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      if (!userId) {
         console.error("ID de usuario no definido para actualizar rol");
         return;
      }
      await userActions.updateRole(userId, newRole);
      setUsers(users.map(u => (u.id === userId || u.uid === userId) ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Error al actualizar el rol");
    }
  };

  // Filtering
  // Filtering robusto
  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(searchUser.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredDiagnostics = diagnostics.filter(d => {
    return (d.userName || "").toLowerCase().includes(searchDiag.toLowerCase()) || 
           (d.userEmail || "").toLowerCase().includes(searchDiag.toLowerCase()) ||
           (d.type || "").toLowerCase().includes(searchDiag.toLowerCase());
  });

  // Data for chart (mocking trends based on registration counts by date)
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
        return d && d.toISOString().split('T')[0] === date;
      }).length,
      d: diagnostics.filter(diag => {
        const d = diag.createdAt?.seconds ? new Date(diag.createdAt.seconds * 1000) : null;
        return d && d.toISOString().split('T')[0] === date;
      }).length
    }));
  };

  const chartData = getChartData();

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-black/20">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName="Panel Administrativo"
        description="Gestiona usuarios y visualiza los diagnósticos realizados en la plataforma."
      />

      <section className="pb-20 pt-10">
        <div className="container">
          {/* Main Layout */}
          <div className="flex flex-col gap-8 lg:flex-row">
            
            {/* Sidebar / Nav */}
            <div className="w-full lg:w-1/4">
              <div className="sticky top-28 space-y-2 rounded-xl border border-body-color/10 bg-white p-4 shadow-one dark:bg-dark">
                <button 
                  onClick={() => setActiveTab("overview")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === "overview" 
                    ? "bg-primary/10 text-primary" 
                    : "text-body-color hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <TrendingUp size={18} />
                  Vista General
                </button>
                <button 
                  onClick={() => setActiveTab("users")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === "users" 
                    ? "bg-primary/10 text-primary" 
                    : "text-body-color hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Users size={18} />
                  Usuarios
                  <span className="ml-auto rounded-full bg-body-color/10 px-2 py-0.5 text-[10px] dark:bg-white/10 group-hover:bg-primary/20">
                    {users.length}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab("diagnostics")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === "diagnostics" 
                    ? "bg-primary/10 text-primary" 
                    : "text-body-color hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <ClipboardCheck size={18} />
                  Diagnósticos
                  <span className="ml-auto rounded-full bg-body-color/10 px-2 py-0.5 text-[10px] dark:bg-white/10">
                    {diagnostics.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 space-y-6">
              
              {/* Stats Cards (Mini) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-body-color/10 bg-white p-6 shadow-sm dark:bg-dark">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-body-color">Total Usuarios</p>
                      <h3 className="mt-1 text-2xl font-bold text-black dark:text-white">{users.length}</h3>
                    </div>
                    <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
                      <Users size={24} />
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl border border-body-color/10 bg-white p-6 shadow-sm dark:bg-dark">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-body-color">Diagnósticos</p>
                      <h3 className="mt-1 text-2xl font-bold text-black dark:text-white">{diagnostics.length}</h3>
                    </div>
                    <div className="rounded-lg bg-green-500/10 p-3 text-green-500">
                      <ClipboardCheck size={24} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-body-color/10 bg-white p-6 shadow-sm dark:bg-dark">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-body-color">Actividad Hoy</p>
                      <h3 className="mt-1 text-2xl font-bold text-black dark:text-white">
                        {chartData[chartData.length-1].u + chartData[chartData.length-1].d}
                      </h3>
                    </div>
                    <div className="rounded-lg bg-orange-500/10 p-3 text-orange-500">
                      <Calendar size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditional Content */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Chart */}
                  <div className="rounded-xl border border-body-color/10 bg-white p-6 shadow-one dark:bg-dark">
                    <h4 className="mb-6 text-lg font-semibold text-black dark:text-white">Tendencias de la última semana</h4>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorU" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4A6CF7" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#4A6CF7" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area type="monotone" dataKey="u" name="Nuevos Usuarios" stroke="#4A6CF7" fillOpacity={1} fill="url(#colorU)" strokeWidth={3} />
                          <Area type="monotone" dataKey="d" name="Diagnósticos" stroke="#10B981" fillOpacity={0.1} fill="#10B981" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Users */}
                    <div className="rounded-xl border border-body-color/10 bg-white p-6 shadow-one dark:bg-dark">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-black dark:text-white">Usuarios Recientes</h4>
                        <button onClick={() => setActiveTab("users")} className="text-sm font-medium text-primary hover:underline">Ver todos</button>
                      </div>
                      <div className="space-y-4">
                        {users.slice(0, 5).map((u) => (
                          <div key={u.id} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-body-color dark:bg-white/10">
                              <User size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-black dark:text-white">{u.name || "Sin nombre"}</p>
                              <p className="text-xs text-body-color">{u.email}</p>
                            </div>
                            <span className="ml-auto text-[10px] text-body-color">
                              {u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Diagnostics */}
                    <div className="rounded-xl border border-body-color/10 bg-white p-6 shadow-one dark:bg-dark">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-black dark:text-white">Últimos Diagnósticos</h4>
                        <button onClick={() => setActiveTab("diagnostics")} className="text-sm font-medium text-primary hover:underline">Ver todos</button>
                      </div>
                      <div className="space-y-4">
                        {diagnostics.slice(0, 5).map((d) => (
                          <div key={d.id} className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${d.type === 'TRL' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'}`}>
                              <span className="text-[10px] font-bold">{d.type || 'TRL'}</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate text-sm font-semibold text-black dark:text-white">{d.userName || d.userEmail || "Anónimo"}</p>
                              <p className="text-xs text-body-color">Nivel: {d.overallLevel || d.summary?.pct ? `${d.summary?.pct}%` : 'N/A'}</p>
                            </div>
                            <span className="text-[10px] text-body-color">
                              {d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="rounded-xl border border-body-color/10 bg-white shadow-one dark:bg-dark">
                  <div className="border-b border-body-color/10 p-6">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                      <h4 className="text-lg font-semibold text-black dark:text-white">Listado de Usuarios</h4>
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-body-color" size={16} />
                        <input 
                          type="text" 
                          placeholder="Buscar usuario..."
                          value={searchUser}
                          onChange={(e) => setSearchUser(e.target.value)}
                          className="w-full rounded-lg border border-body-color/10 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:bg-white/5"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs font-semibold uppercase text-body-color dark:bg-white/5">
                        <tr>
                          <th className="px-6 py-4">Usuario</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Proveedor</th>
                          <th className="px-6 py-4">Registro</th>
                          <th className="px-6 py-4">Rol</th>
                          <th className="px-6 py-4">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-body-color/10">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="group hover:bg-gray-50 dark:hover:bg-white/5">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                  <User size={14} />
                                </div>
                                <span className="text-sm font-medium text-black dark:text-white">{u.name || "Sin nombre"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-body-color">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${u.provider === 'google' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                {u.provider || 'Email'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-body-color">
                              {u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <select 
                                value={u.role || 'user'} 
                                onChange={(e) => handleUpdateRole(u.id || (u.uid as string), e.target.value)}
                                className="rounded-md border border-body-color/10 bg-transparent px-2 py-1 text-xs focus:border-primary outline-none dark:bg-dark"
                              >
                                <option value="user">Usuario</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button className="rounded-md p-1.5 text-body-color hover:bg-primary/10 hover:text-primary transition-colors">
                                  <ExternalLink size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "diagnostics" && (
                <div className="rounded-xl border border-body-color/10 bg-white shadow-one dark:bg-dark">
                  <div className="border-b border-body-color/10 p-6">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                      <h4 className="text-lg font-semibold text-black dark:text-white">Historial de Diagnósticos</h4>
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-body-color" size={16} />
                        <input 
                          type="text" 
                          placeholder="Buscar diagnóstico o usuario..."
                          value={searchDiag}
                          onChange={(e) => setSearchDiag(e.target.value)}
                          className="w-full rounded-lg border border-body-color/10 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:bg-white/5"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs font-semibold uppercase text-body-color dark:bg-white/5">
                        <tr>
                          <th className="px-6 py-4">Usuario</th>
                          <th className="px-6 py-4">Tipo</th>
                          <th className="px-6 py-4">Empresa</th>
                          <th className="px-6 py-4">Nivel/Score</th>
                          <th className="px-6 py-4">Fecha</th>
                          <th className="px-6 py-4">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-body-color/10">
                        {filteredDiagnostics.map((d) => (
                          <tr key={d.id} className="group hover:bg-gray-50 dark:hover:bg-white/5">
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-black dark:text-white">{d.userName || d.userEmail || "Anónimo"}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${d.type === 'CRL' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                                {d.type || 'TRL'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-body-color">{d.companyName || d.profile?.org || '-'}</td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                 <span className="text-sm font-bold text-black dark:text-white">
                                   {d.summary?.pct ? `${d.summary.pct}%` : (d.overallLevel || d.score || 'N/A')}
                                 </span>
                                 <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                   <div 
                                    className={`h-full ${d.type === 'CRL' ? 'bg-green-500' : 'bg-primary'}`} 
                                    style={{ width: `${d.summary?.pct || (((d.overallLevel || d.score || 0) / 9) * 100)}%` }}
                                   ></div>
                                 </div>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-body-color">
                              {d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => router.push(`/diagnosis/results/${d.id}`)}
                                  className="rounded-md p-1.5 text-body-color hover:bg-primary/10 hover:text-primary transition-colors"
                                  title="Ver detalles"
                                >
                                  <ExternalLink size={16} />
                                </button>
                                <button 
                                  className="rounded-md p-1.5 text-body-color hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
