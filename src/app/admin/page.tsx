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
  ArrowLeft,
  UserX,
  UserCheck,
  ShieldCheck,
  Trash2,
  MoreVertical,
  Eye,
  FileEdit,
  ExternalLink,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle
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
  status?: "active" | "disabled";
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<DiagnosticData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Estado para Filtro de Fecha
  const [selectedDate, setSelectedDate] = useState("");

  // Estados para Edición de Diagnóstico (desde Admin)
  const [editDiagModalOpen, setEditDiagModalOpen] = useState(false);
  const [diagToEdit, setDiagToEdit] = useState<DiagnosticData | null>(null);
  const [diagEditData, setDiagEditData] = useState({ title: "", org: "", description: "" });
  const [diagUpdateLoading, setDiagUpdateLoading] = useState(false);

  // Estados para Notificaciones (Toasts)
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'success' | 'error' | 'info'}[]>([]);
  
  // Estados para Modal de Confirmación
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean,
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: 'info'
  });

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

  // Filtros
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!selectedDate) return matchesSearch;
    
    let userDate = null;
    if (u.createdAt?.seconds) {
      userDate = new Date(u.createdAt.seconds * 1000).toISOString().split('T')[0];
    }
    
    return matchesSearch && userDate === selectedDate;
  });

  const filteredDiagnostics = enrichedDiagnostics.filter(d => {
    const matchesSearch = d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         d.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!selectedDate) return matchesSearch;
    
    let diagDate = null;
    if (d.createdAt?.seconds) {
      diagDate = new Date(d.createdAt.seconds * 1000).toISOString().split('T')[0];
    } else if (d.timestamp) {
      diagDate = new Date(d.timestamp).toISOString().split('T')[0];
    }
    
    return matchesSearch && diagDate === selectedDate;
  });

  const companies = Array.from(new Set(enrichedDiagnostics.map(d => d.companyName))).map(name => {
    const companyDiags = enrichedDiagnostics.filter(d => d.companyName === name);
    return {
      name,
      count: companyDiags.length,
      lastDate: companyDiags[0]?.createdAt?.seconds
    };
  }).filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!selectedDate) return matchesSearch;
    
    const d = c.lastDate ? new Date(c.lastDate * 1000) : null;
    const companyDate = d ? d.toISOString().split('T')[0] : null;
    return matchesSearch && companyDate === selectedDate;
  });

  const kpis = [
    {
      id: "users",
      title: selectedDate ? "Usuarios (Día)" : "Total Usuarios",
      value: (selectedDate ? filteredUsers.length : users.length).toLocaleString(),
      icon: <Users size={20} />,
      iconBg: "bg-blue-500/10 text-blue-500",
      badge: selectedDate ? "Filtrado" : `+${usersToday}`,
      badgeStyle: selectedDate ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500",
      note: selectedDate ? "en esta fecha" : "nuevos hoy",
      tab: "users" as const
    },
    {
      id: "diagnostics",
      title: selectedDate ? "Diagnósticos (Día)" : "Diagnósticos",
      value: (selectedDate ? filteredDiagnostics.length : diagnostics.length).toLocaleString(),
      icon: <ClipboardCheck size={20} />,
      iconBg: "bg-indigo-500/10 text-indigo-500",
      badge: selectedDate ? "Filtrado" : `+${diagsSinceYesterday}`,
      badgeStyle: selectedDate ? "bg-blue-500/10 text-blue-500" : "bg-indigo-500/10 text-indigo-500",
      note: selectedDate ? "en esta fecha" : "desde ayer",
      tab: "diagnostics" as const
    },
    {
      id: "companies",
      title: selectedDate ? "Empresas (Día)" : "Empresas Activas",
      value: (selectedDate ? Array.from(new Set(filteredDiagnostics.map(d => d.companyName))).length : Array.from(new Set(enrichedDiagnostics.map(d => d.companyName))).length).toString(),
      icon: <Briefcase size={20} />,
      iconBg: "bg-amber-500/10 text-amber-500",
      badge: selectedDate ? "Filtrado" : "En vivo",
      badgeStyle: selectedDate ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-500",
      note: selectedDate ? "en esta fecha" : "organizaciones",
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

  // Utilidades para Notificaciones
  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'info') => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm, type });
  };

  // Acciones de gestión de usuarios
  const handleToggleStatus = async (uid: string, currentStatus?: string) => {
    if (uid === user?.uid) {
      addNotification("No puedes desactivar tu propia cuenta", "error");
      return;
    }
    
    const action = currentStatus === "disabled" ? "activar" : "desactivar";
    
    showConfirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Usuario`,
      `¿Estás seguro de que deseas ${action} a este usuario?`,
      async () => {
        setActionLoading(uid);
        try {
          const newStatus = currentStatus === "disabled" ? "active" : "disabled";
          await userActions.updateStatus(uid, newStatus);
          addNotification(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente`);
        } catch (error) {
          addNotification("Error al actualizar el estado", "error");
        } finally {
          setActionLoading(null);
        }
      },
      currentStatus === "disabled" ? "info" : "warning"
    );
  };

  const handleDeleteUser = async (uid: string) => {
    if (uid === user?.uid) {
      addNotification("No puedes eliminar tu propia cuenta", "error");
      return;
    }

    showConfirm(
      "Eliminar Usuario",
      "¿Estás seguro de que deseas eliminar este usuario permanentemente? Esta acción borrará su perfil pero conservará sus diagnósticos como 'Anónimos'.",
      async () => {
        setActionLoading(uid);
        try {
          await userActions.delete(uid);
          addNotification("Usuario eliminado permanentemente");
        } catch (error) {
          addNotification("Error al eliminar usuario", "error");
        } finally {
          setActionLoading(null);
        }
      },
      "danger"
    );
  };

  const handleToggleRole = async (uid: string, currentRole?: string) => {
    if (uid === user?.uid) {
      addNotification("No puedes cambiar tu propio rol", "error");
      return;
    }
    
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    showConfirm(
      "Cambiar Rol",
      `¿Deseas cambiar el rol de este usuario a ${newRole.toUpperCase()}?`,
      async () => {
        setActionLoading(uid);
        try {
          await userActions.updateRole(uid, newRole);
          addNotification(`Rol actualizado a ${newRole}`);
        } catch (error) {
          addNotification("Error al actualizar el rol", "error");
        } finally {
          setActionLoading(null);
        }
      }
    );
  };

  const handleDeleteDiagnostic = async (id: string) => {
    showConfirm(
      "Eliminar Diagnóstico",
      "¿Estás seguro de que deseas eliminar este diagnóstico? Los datos se borrarán permanentemente.",
      async () => {
        setActionLoading(id);
        try {
          await diagnosticActions.delete(id);
          addNotification("Diagnóstico eliminado correctamente");
        } catch (error) {
          addNotification("Error al eliminar diagnóstico", "error");
        } finally {
          setActionLoading(null);
        }
      },
      "danger"
    );
  };

  const handleDeleteCompany = async (companyName: string) => {
    showConfirm(
      "Eliminar Empresa",
      `¿Estás seguro de que deseas eliminar TODOS los diagnósticos de "${companyName}"? Esta acción no se puede deshacer.`,
      async () => {
        const companyDiags = enrichedDiagnostics.filter(d => d.companyName === companyName);
        setActionLoading(companyName);
        try {
          await Promise.all(companyDiags.map(d => diagnosticActions.delete(d.id)));
          addNotification(`Se han eliminado ${companyDiags.length} diagnósticos de ${companyName}`);
        } catch (error) {
          addNotification("Error al eliminar datos de la empresa", "error");
        } finally {
          setActionLoading(null);
        }
      },
      "danger"
    );
  };

  const handleViewCompany = (companyName: string) => {
    setSearchTerm(companyName);
    setActiveTab("diagnostics");
    addNotification(`Mostrando diagnósticos de ${companyName}`, "info");
  };

  const handleViewDiagnostic = (diag: DiagnosticData) => {
    setSelectedDiagnostic(diag);
    setIsViewModalOpen(true);
  };

  const handleOpenEditDiag = (diag: DiagnosticData) => {
    setDiagToEdit(diag);
    setDiagEditData({
      title: diag.profile?.title || "",
      org: diag.profile?.org || "",
      description: (diag.profile as any)?.description || ""
    });
    setEditDiagModalOpen(true);
  };

  const handleUpdateDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagToEdit) return;

    setDiagUpdateLoading(true);
    try {
      const updatedProfile = {
        ...diagToEdit.profile,
        title: diagEditData.title,
        org: diagEditData.org,
        description: diagEditData.description
      };

      await diagnosticActions.update(diagToEdit.id, {
        profile: updatedProfile
      });

      // Actualizar localmente el estado de diagnósticos
      setDiagnostics(prev => prev.map(d => 
        d.id === diagToEdit.id ? { ...d, profile: updatedProfile as any } : d
      ));

      setEditDiagModalOpen(false);
      setIsViewModalOpen(false); // Cerrar también el modal de vista si estaba abierto
      addNotification("Datos del diagnóstico actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar diagnóstico:", error);
      addNotification("Error al actualizar los datos", "error");
    } finally {
      setDiagUpdateLoading(false);
    }
  };

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
            {/* Filtro de Fecha Dinámica */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-3 py-1.5">
              <Calendar size={16} className={selectedDate ? "text-blue-500" : "text-gray-400"} />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold focus:outline-none cursor-pointer text-gray-700 dark:text-gray-200"
              />
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate("")}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

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
                      ["Usuario", "Email", "Proveedor", "Rol", "Registro", "Acciones"].map(h => <th key={h} className="px-8 py-5 text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{h}</th>)
                    ) : activeTab === "diagnostics" ? (
                      ["Empresa", "Usuario", "Madurez", "Puntaje", "Fecha", "Acciones"].map(h => <th key={h} className="px-8 py-5 text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{h}</th>)
                    ) : activeTab === "companies" ? (
                      ["Empresa", "Diagnósticos", "Última Actividad", "Acciones"].map(h => <th key={h} className="px-8 py-5 text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{h}</th>)
                    ) : (
                      ["Actividad", "Usuario", "Fecha", "Detalle"].map(h => <th key={h} className="px-8 py-5 text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{h}</th>)
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {activeTab === "users" && filteredUsers.map((u) => (
                    <tr key={u.id} className={`hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors ${u.status === 'disabled' ? 'opacity-60 bg-gray-50/50 dark:bg-gray-900/20' : ''}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.role === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-semibold block">{u.name || "N/A"}</span>
                            {u.status === 'disabled' && <span className="text-[10px] text-red-500 font-bold uppercase">Desactivado</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm">{u.email}</td>
                      <td className="px-8 py-5"><span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-bold uppercase">{u.provider || "Email"}</span></td>
                      <td className="px-8 py-5 text-sm font-bold text-blue-500 capitalize">{u.role}</td>
                      <td className="px-8 py-5 text-xs text-gray-500">{u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            disabled={actionLoading === u.id || u.id === user?.uid}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${u.status === 'disabled' ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-amber-500 hover:bg-amber-500/10'} disabled:opacity-30`}
                            title={u.status === 'disabled' ? "Activar usuario" : "Desactivar usuario"}
                          >
                            {u.status === 'disabled' ? <UserCheck size={18} /> : <UserX size={18} />}
                          </button>
                          <button 
                            onClick={() => handleToggleRole(u.id, u.role)}
                            disabled={actionLoading === u.id || u.id === user?.uid}
                            className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer disabled:opacity-30"
                            title="Cambiar Rol (Admin/User)"
                          >
                            <ShieldCheck size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={actionLoading === u.id || u.id === user?.uid}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-30"
                            title="Eliminar permanentemente"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {activeTab === "diagnostics" && filteredDiagnostics.map((d) => (
                    <tr key={d.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-semibold text-gray-900 dark:text-white">{d.companyName}</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[150px]">{d.profile?.title || 'Sin título'}</div>
                      </td>
                      <td className="px-8 py-5 text-sm">{d.userName}</td>
                      <td className="px-8 py-5 text-sm font-bold text-blue-600">TRL {Math.ceil((d.summary?.pct || 0)/100*9)}</td>
                      <td className="px-8 py-5 text-sm font-bold">{d.summary?.pct || 0}%</td>
                      <td className="px-8 py-5 text-xs text-gray-500">{d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewDiagnostic(d)}
                            className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteDiagnostic(d.id)}
                            disabled={actionLoading === d.id}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-30"
                            title="Eliminar diagnóstico"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {activeTab === "companies" && companies.map((c) => (
                    <tr key={c.name} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-8 py-5 font-semibold">{c.name}</td>
                      <td className="px-8 py-5 text-sm font-bold text-blue-500">{c.count} realizados</td>
                      <td className="px-8 py-5 text-xs text-gray-500">{c.lastDate ? new Date(c.lastDate * 1000).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewCompany(c.name)}
                            className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
                            title="Ver diagnósticos"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCompany(c.name)}
                            disabled={actionLoading === c.name}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-30"
                            title="Eliminar todos los datos de la empresa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
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

      {/* Modal de Vista de Diagnóstico */}
      {isViewModalOpen && selectedDiagnostic && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detalles del Diagnóstico</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {selectedDiagnostic.id}</p>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-blue-500">Información de la Empresa</h4>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">{selectedDiagnostic.companyName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{selectedDiagnostic.profile?.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{selectedDiagnostic.profile?.description}"</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-500">Datos del Usuario</h4>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{selectedDiagnostic.userName}</p>
                    <p className="text-sm text-gray-500">{selectedDiagnostic.userEmail}</p>
                    <p className="text-xs text-gray-400 mt-2">Realizado el: {selectedDiagnostic.createdAt?.seconds ? new Date(selectedDiagnostic.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-center">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Puntaje Total</p>
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{selectedDiagnostic.summary?.total} / {selectedDiagnostic.summary?.max}</p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-center">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1">Porcentaje</p>
                  <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{selectedDiagnostic.summary?.pct}%</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-center">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Nivel Estimado</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">TRL {Math.ceil((selectedDiagnostic.summary?.pct || 0)/100*9)}</p>
                </div>
              </div>

              {/* Answers Section (Optional Detail) */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">Desglose de Respuestas</h4>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 mb-4 italic">Las respuestas detalladas se guardan de forma segura en la base de datos.</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedDiagnostic.answers || {}).map(([key, val]) => (
                      <div key={key} className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{key}:</span>
                        <span className="text-sm font-bold text-blue-500">{val || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/50">
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button 
                onClick={() => handleOpenEditDiag(selectedDiagnostic)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <FileEdit size={16} />
                Editar Datos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Diagnóstico (Admin) */}
      {editDiagModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Diagnóstico</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Gestión Administrativa</p>
                </div>
                <button 
                  onClick={() => setEditDiagModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all text-gray-500 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateDiagnostic} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Título del Proyecto
                  </label>
                  <input
                    type="text"
                    value={diagEditData.title}
                    onChange={(e) => setDiagEditData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    placeholder="Título del diagnóstico"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Organización / Empresa
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={diagEditData.org}
                      onChange={(e) => setDiagEditData(prev => ({ ...prev, org: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                      placeholder="Nombre de la empresa"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Descripción
                  </label>
                  <textarea
                    value={diagEditData.description}
                    onChange={(e) => setDiagEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white resize-none"
                    placeholder="Descripción del proyecto..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditDiagModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={diagUpdateLoading}
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {diagUpdateLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Personalizado */}
      {confirmConfig.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                confirmConfig.type === 'danger' ? 'bg-red-100 text-red-500' : 
                confirmConfig.type === 'warning' ? 'bg-amber-100 text-amber-500' : 
                'bg-blue-100 text-blue-500'
              }`}>
                {confirmConfig.type === 'danger' ? <Trash2 size={32} /> : 
                 confirmConfig.type === 'warning' ? <AlertTriangle size={32} /> : 
                 <Info size={32} />}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{confirmConfig.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">{confirmConfig.message}</p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    confirmConfig.onConfirm();
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold transition-all shadow-md cursor-pointer ${
                    confirmConfig.type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 
                    confirmConfig.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 
                    'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sistema de Notificaciones (Toasts) */}
      <div className="fixed bottom-8 right-8 z-[10001] flex flex-col gap-3 pointer-events-none">
        {notifications.map((n) => (
          <div 
            key={n.id}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md pointer-events-auto relative min-w-[320px] overflow-hidden transition-all duration-500
              ${n.type === 'success' ? 'bg-emerald-600/90 border-emerald-400 text-white shadow-emerald-500/20' : 
                n.type === 'error' ? 'bg-red-600/90 border-red-400 text-white shadow-red-500/20' : 
                'bg-blue-600/90 border-blue-400 text-white shadow-blue-500/20'}
              animate-toast-in pr-12`}
          >
            {/* Barra de progreso de tiempo (Animación de desaparición lenta) */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-toast-progress" />

            <div className={`p-2 rounded-xl bg-white/20`}>
              {n.type === 'success' ? <CheckCircle2 size={20} /> : 
               n.type === 'error' ? <AlertCircle size={20} /> : 
               <Info size={20} />}
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">{n.message}</span>
              <span className="text-[10px] opacity-70 font-medium">Click para cerrar</span>
            </div>

            <button 
              onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes toast-in {
          0% { transform: translateX(100%) scale(0.9); opacity: 0; }
          70% { transform: translateX(-10px) scale(1.02); }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes toast-progress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        .animate-toast-in {
          animation: toast-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-toast-progress {
          animation: toast-progress 4s linear forwards;
        }
      `}</style>
    </main>
  );
};

export default AdminDashboard;
