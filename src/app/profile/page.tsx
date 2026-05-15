"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { diagnosticActions, userActions } from "@/../backend/crud";
import { updateUserProfileInfo, logout } from "@/../backend/auth";
import { uploadProfilePhoto } from "@/../backend/storage";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import Image from "next/image";
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
  AlertCircle,
  Camera,
  Filter,
  ArrowRight,
  ChevronRight,
  Clock,
  LayoutGrid,
  ShieldCheck,
  Users
} from "lucide-react";

const ProfilePage = () => {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    console.log("📸 handlePhotoUpload iniciado (base64)");
    console.log("📁 Archivo:", file.name, "Tamaño:", file.size, "Tipo:", file.type);
    console.log("👤 Usuario ID:", user.uid);

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      addNotification("Por favor, selecciona una imagen válida", "error");
      return;
    }

    // Validar tamaño (máximo 5MB, se comprimirá después a ~200KB base64)
    if (file.size > 5 * 1024 * 1024) {
      addNotification("La imagen es muy pesada (máximo 5MB)", "error");
      return;
    }

    setPhotoLoading(true);
    try {
      console.log("🚀 Iniciando uploadProfilePhoto (base64)...");
      // Usar la función de subida con compresión a base64
      const base64Photo = await uploadProfilePhoto(file, user.uid);
      console.log("✅ uploadProfilePhoto completado, base64 generado");
      
      console.log("🔄 Actualizando perfil con nueva foto (base64)...");
      await updateUserProfileInfo(user.displayName, base64Photo);
      console.log("✅ Perfil actualizado");
      
      console.log("🔄 Refrescando usuario...");
      await refreshUser();
      console.log("✅ Usuario refrescado");
      
      addNotification("Foto de perfil actualizada");
    } catch (error: any) {
      console.error("❌ Error al subir foto:", error);
      console.error("Error message:", error?.message);
      addNotification(`Error: ${error?.message || "Error al subir la imagen"}`, "error");
    } finally {
      console.log("🏁 Finalizando handlePhotoUpload");
      setPhotoLoading(false);
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
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F2D] pt-32 md:pt-40 pb-20">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container relative z-10">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                <LayoutGrid size={12} />
                Panel de Control
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Mi <span className="text-primary">Perfil</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/#calculator"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white font-black text-sm hover:scale-105 transition-all shadow-lg shadow-primary/25"
              >
                <Plus size={18} />
                Nuevo Diagnóstico
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: User Card & Stats */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="h-32 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              </div>
              
              <div className="px-8 pb-8 -mt-16 relative">
                <div className="flex flex-col items-center">
                  <div className="relative mb-6 group">
                    <div className="relative h-32 w-32 overflow-hidden rounded-[2rem] border-4 border-white dark:border-[#0A0F2D] shadow-2xl bg-slate-100 dark:bg-slate-800 transition-transform duration-500 group-hover:scale-105">
                      {photoLoading ? (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                      ) : user.photoURL ? (
                        <Image 
                          src={user.photoURL} 
                          alt={user.displayName || "Usuario"} 
                          fill
                          className="object-cover" 
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-primary to-blue-700 flex h-full w-full items-center justify-center text-4xl font-black text-white uppercase">
                          {user.displayName?.[0] || user.email?.[0]}
                        </div>
                      )}
                    </div>
                    
                    {/* Photo Upload Trigger */}
                    <label className="absolute bottom-1 right-1 h-10 w-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white dark:hover:bg-primary transition-all group/btn">
                      <Camera size={18} />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={photoLoading}
                      />
                    </label>
                  </div>

                  <div className="text-center w-full mb-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                      {user.displayName || "Usuario"}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                      <Mail size={14} className="text-primary" />
                      {user.email}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full mb-8">
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl border border-slate-100 dark:border-white/5 text-center">
                      <div className="text-2xl font-black text-primary">{diagnostics.length}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Proyectos</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl border border-slate-100 dark:border-white/5 text-center">
                      <div className="text-2xl font-black text-emerald-500">
                        {diagnostics.length > 0 ? Math.max(...diagnostics.map(d => d.summary?.pct || 0)) : 0}%
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Madurez Max</div>
                    </div>
                  </div>

                  <div className="space-y-3 w-full">
                    <button
                      onClick={() => setEditModalOpen(true)}
                      className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-[#0A0F2D] font-black text-sm hover:opacity-90 transition-all cursor-pointer"
                    >
                      <Settings size={18} />
                      Editar Perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 font-black text-sm hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                    >
                      <LogOut size={18} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Support/Info Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-primary/20 dark:to-blue-900/20 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Info size={120} />
              </div>
              <h4 className="text-xl font-black mb-3 relative z-10">¿Necesitas ayuda?</h4>
              <p className="text-slate-400 dark:text-blue-100/60 text-sm font-medium mb-6 relative z-10">
                Consulta nuestra guía detallada sobre los niveles TRL y CRL para entender mejor tus resultados.
              </p>
              <Link href="#" className="inline-flex items-center gap-2 text-primary dark:text-white font-black text-sm group/link relative z-10">
                Ver Documentación
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Diagnostics List */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-6 md:p-10 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <ClipboardCheck className="text-primary" size={28} />
                    Mis Diagnósticos
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                    Historial de evaluaciones técnicas y comerciales
                  </p>
                </div>
              </div>

              {diagnostics.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-white/10 mb-6">
                    <ClipboardCheck size={48} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                    Aún no tienes diagnósticos
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 max-w-xs mx-auto">
                    Comienza tu primera evaluación técnica y comercial ahora mismo.
                  </p>
                  <Link
                    href="/#calculator"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-lg shadow-primary/25"
                  >
                    Crear Primer Diagnóstico
                    <ChevronRight size={18} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {diagnostics.map((diag) => (
                    <div
                      key={diag.id}
                      className="group bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2rem] p-6 md:p-8 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 relative overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-start gap-5">
                          <div className="w-16 h-16 shrink-0 rounded-2xl bg-white dark:bg-[#0A0F2D] border border-slate-100 dark:border-white/10 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform duration-500">
                            <Building2 size={28} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                {diag.profile?.title || "Proyecto sin título"}
                              </h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <Building2 size={14} className="text-primary/60" />
                                {diag.profile?.org || "Sin Organización"}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <Clock size={14} className="text-primary/60" />
                                {new Date(diag.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white dark:bg-[#0A0F2D]/50 p-4 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
                          <div className="text-right">
                            <div className="text-2xl font-black text-primary leading-none">{diag.summary?.pct}%</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Madurez</div>
                          </div>
                          <div className="h-10 w-[1px] bg-slate-100 dark:bg-white/10"></div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-emerald-500 leading-none">TRL {Math.ceil((diag.summary?.pct || 0)/100*9)}</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Nivel TRL</div>
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-500 dark:text-slate-400 mt-6 text-sm font-medium line-clamp-2 leading-relaxed relative z-10">
                        {diag.profile?.description || "Sin descripción proporcionada para este diagnóstico."}
                      </p>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-white/10 relative z-10">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <Link
                            href={`/diagnosis/${diag.id}`}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 transition-all shadow-md shadow-primary/20"
                          >
                            <Eye size={16} />
                            Detalles
                          </Link>
                          <button
                            onClick={() => handleOpenEditDiag(diag)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-[#0A0F2D] text-xs font-black hover:opacity-90 transition-all"
                          >
                            <Pencil size={16} />
                            Editar
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteDiagnostic(diag.id)}
                          className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-xs font-bold"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <Link
                      href="/#calculator"
                      className="flex items-center justify-center gap-3 w-full rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-8 text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all font-black group"
                    >
                      <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                      Agregar Nuevo Proyecto
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
