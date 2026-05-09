"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { diagnosticActions } from "@/../backend/crud";
import { updateUserProfileInfo, logout } from "@/../backend/auth";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Settings, 
  LogOut, 
  Plus, 
  ClipboardCheck, 
  Trash2, 
  Eye, 
  Building2, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Pencil,
  AlertCircle
} from "lucide-react";

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Estados para Edición de Diagnóstico
  const [editDiagModalOpen, setEditDiagModalOpen] = useState(false);
  const [diagToEdit, setDiagToEdit] = useState<any>(null);
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

  useEffect(() => {
    if (user) {
      fetchDiagnostics();
      setNewName(user.displayName || "");
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchDiagnostics = async () => {
    try {
      const data = await diagnosticActions.getByUserId(user.uid);
      setDiagnostics(data || []);
    } catch (error) {
      console.error("Error al obtener diagnósticos:", error);
      addNotification("Error al cargar diagnósticos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiagnostic = async (id: string) => {
    showConfirm(
      "Eliminar Proyecto",
      "¿Estás seguro de que deseas eliminar este proyecto permanentemente? Los datos se borrarán de tu historial.",
      async () => {
        try {
          await diagnosticActions.delete(id);
          setDiagnostics(diagnostics.filter((d) => d.id !== id));
          addNotification("Proyecto eliminado correctamente");
        } catch (error) {
          addNotification("Error al eliminar el diagnóstico", "error");
        }
      },
      "danger"
    );
  };

  const handleOpenEditDiag = (diag: any) => {
    setDiagToEdit(diag);
    setDiagEditData({
      title: diag.profile?.title || "",
      org: diag.profile?.org || "",
      description: diag.profile?.description || ""
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

      setDiagnostics(prev => prev.map(d => 
        d.id === diagToEdit.id ? { ...d, profile: updatedProfile } : d
      ));

      setEditDiagModalOpen(false);
      addNotification("Datos del diagnóstico actualizados");
    } catch (error) {
      console.error("Error al actualizar diagnóstico:", error);
      addNotification("Error al actualizar los datos", "error");
    } finally {
      setDiagUpdateLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await updateUserProfileInfo(newName);
      setEditModalOpen(false);
      addNotification("Perfil actualizado con éxito");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      addNotification("Error al actualizar perfil", "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    showConfirm(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir de tu cuenta?",
      () => {
        window.location.href = "/";
      },
      "warning"
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Breadcrumb pageName="Mi Perfil" description="Lo sentimos, debes iniciar sesión para ver tu perfil." />
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container text-center">
            <div className="inline-flex p-6 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full mb-6">
              <LogOut size={48} />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Acceso Denegado</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Para ver tus proyectos y gestionar tu perfil, primero debes autenticarte en el sistema.
            </p>
            <Link href="/signin" className="bg-primary hover:bg-primary/90 rounded-xl px-10 py-4 text-white font-bold transition-all shadow-lg shadow-primary/20">
              Ir a Iniciar Sesión
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <Breadcrumb
        pageName="Mi Perfil"
        description="Gestiona tus proyectos y revisa el historial de tus diagnósticos TRL & CRL."
      />

      <section className="pb-24 pt-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* User Info Sidebar */}
            <aside className="w-full lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-32">
                {/* Profile Banner/Header */}
                <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                
                <div className="px-8 pb-8 -mt-12">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-3xl border-4 border-white dark:border-gray-800 shadow-xl bg-white dark:bg-gray-700">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="bg-blue-500 flex h-full w-full items-center justify-center text-4xl font-black text-white">
                          {user.displayName?.[0] || user.email?.[0]}
                        </div>
                      )}
                    </div>

                    <div className="text-center w-full">
                      <h4 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                        {user.displayName || "Usuario"}
                      </h4>
                      <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-6">
                        <Mail size={14} />
                        <span className="text-sm font-medium">{user.email}</span>
                      </div>
                      <button
                        onClick={() => setEditModalOpen(true)}
                        className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                      >
                        <Settings size={14} />
                        Configurar Perfil
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 space-y-3">
                    <Link
                      href="/#calculator"
                      className="flex items-center justify-center gap-2 w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Plus size={18} />
                      Nuevo Diagnóstico
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-red-500 hover:border-red-500 transition-all cursor-pointer"
                    >
                      <LogOut size={18} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Diagnostics List */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                      <ClipboardCheck className="text-blue-600" size={28} />
                      Tus Proyectos
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Gestiona tu historial de madurez tecnológica y comercial
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black uppercase tracking-wider">
                    {diagnostics.length} Diagnósticos
                  </div>
                </div>

                {diagnostics.length === 0 ? (
                  <div className="py-20 text-center bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="mb-6 flex justify-center text-gray-300">
                      <ClipboardCheck size={80} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg font-medium max-w-xs mx-auto">
                      Aún no has realizado ningún diagnóstico técnico o comercial.
                    </p>
                    <Link
                      href="/#calculator"
                      className="bg-blue-600 hover:bg-blue-700 inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-base font-black text-white transition-all shadow-xl shadow-blue-500/20"
                    >
                      <Plus size={20} />
                      Empezar Ahora
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {diagnostics.map((diag) => (
                      <div
                        key={diag.id}
                        className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 transition-all hover:shadow-xl hover:border-blue-500/30 relative"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                              <Building2 size={24} />
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {diag.profile?.title || "Proyecto sin título"}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <Building2 size={12} />
                                  {diag.profile?.org || "Sin Organización"}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Calendar size={12} />
                                  {new Date(diag.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                              <span className="text-2xl font-black text-blue-600">{diag.summary?.pct}%</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Madurez</span>
                            </div>
                            <div className="h-12 w-1 bg-gray-100 dark:bg-gray-700 rounded-full mx-1"></div>
                            <div className="flex flex-col items-end">
                              <span className="text-2xl font-black text-emerald-500">TRL {Math.ceil((diag.summary?.pct || 0)/100*9)}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Nivel Estimado</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm line-clamp-2 leading-relaxed">
                          {diag.profile?.description || "Sin descripción proporcionada."}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/diagnosis/${diag.id}`}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black hover:bg-blue-600 hover:text-white transition-all"
                            >
                              <Eye size={14} />
                              Ver Reporte
                            </Link>
                            <button
                              onClick={() => handleOpenEditDiag(diag)}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-black hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                            >
                              <Pencil size={14} />
                              Editar
                            </button>
                          </div>
                          <button
                            onClick={() => handleDeleteDiagnostic(diag.id)}
                            className="p-2.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                            title="Eliminar proyecto"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="mt-8">
                      <Link
                        href="/#calculator"
                        className="flex items-center justify-center gap-3 w-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 text-gray-400 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all font-bold cursor-pointer"
                      >
                        <Plus size={24} />
                        Agregar Nuevo Proyecto al Historial
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Edición de Perfil */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Configurar Perfil</h3>
                <button 
                  onClick={() => setEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 px-6 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="flex-1 px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {updateLoading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Diagnóstico */}
      {editDiagModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Editar Proyecto</h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">Información General</p>
                </div>
                <button 
                  onClick={() => setEditDiagModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateDiagnostic} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Título del Proyecto
                  </label>
                  <input
                    type="text"
                    value={diagEditData.title}
                    onChange={(e) => setDiagEditData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    placeholder="Ej: Desarrollo de Prototipo X"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Organización / Empresa
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={diagEditData.org}
                      onChange={(e) => setDiagEditData(prev => ({ ...prev, org: e.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 pl-12 pr-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                      placeholder="Nombre de la entidad"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Descripción Breve
                  </label>
                  <textarea
                    value={diagEditData.description}
                    onChange={(e) => setDiagEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white resize-none"
                    placeholder="Describe brevemente el alcance del proyecto..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditDiagModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={diagUpdateLoading}
                    className="flex-2 px-6 py-4 rounded-2xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {diagUpdateLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Guardar Cambios
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
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in duration-200">
            <div className="p-8 flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${
                confirmConfig.type === 'danger' ? 'bg-red-100 text-red-500' : 
                confirmConfig.type === 'warning' ? 'bg-amber-100 text-amber-500' : 
                'bg-blue-100 text-blue-500'
              }`}>
                {confirmConfig.type === 'danger' ? <Trash2 size={36} /> : 
                 confirmConfig.type === 'warning' ? <AlertTriangle size={36} /> : 
                 <Info size={36} />}
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{confirmConfig.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">{confirmConfig.message}</p>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-6 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    confirmConfig.onConfirm();
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={`flex-1 px-6 py-3.5 rounded-2xl text-white font-black transition-all shadow-lg cursor-pointer ${
                    confirmConfig.type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 
                    confirmConfig.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 
                    'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
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
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md pointer-events-auto relative min-w-[340px] overflow-hidden transition-all duration-500
              ${n.type === 'success' ? 'bg-emerald-600/90 border-emerald-400 text-white' : 
                n.type === 'error' ? 'bg-red-600/90 border-red-400 text-white' : 
                'bg-blue-600/90 border-blue-400 text-white'}
              animate-toast-in pr-14`}
          >
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-toast-progress" />
            <div className="p-2.5 rounded-xl bg-white/20">
              {n.type === 'success' ? <CheckCircle2 size={22} /> : 
               n.type === 'error' ? <AlertCircle size={22} /> : 
               <Info size={22} />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight">{n.message}</span>
              <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Información</span>
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
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

export default ProfilePage;
