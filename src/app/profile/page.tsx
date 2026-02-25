"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { diagnosticActions } from "@/../backend/crud";
import { updateUserProfileInfo, logout } from "@/../backend/auth";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";


const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);


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
      console.log("Iniciando carga de diagnósticos para el usuario:", user.uid);
      const data = await diagnosticActions.getByUserId(user.uid);
      console.log("Diagnósticos recibidos:", data);
      setDiagnostics(data || []);
    } catch (error) {
      console.error("Error al obtener diagnósticos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiagnostic = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este proyecto?")) {
      try {
        await diagnosticActions.delete(id);
        setDiagnostics(diagnostics.filter((d) => d.id !== id));
      } catch (error) {
        alert("Error al eliminar el diagnóstico");
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await updateUserProfileInfo(newName);
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      alert("Error al actualizar perfil");
    } finally {
      setUpdateLoading(false);
    }
  };


  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Breadcrumb pageName="Mi Perfil" description="Lo sentimos, debes iniciar sesión para ver tu perfil." />
        <section className="py-20">
          <div className="container text-center">
            <h2 className="mb-4 text-2xl font-bold">Acceso Denegado</h2>
            <Link href="/signin" className="bg-primary hover:bg-primary/90 rounded-sm px-8 py-3 text-white">
              Ir a Iniciar Sesión
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName="Mi Perfil"
        description="Gestiona tus proyectos y revisa el historial de tus diagnósticos TRL & CRL."
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            {/* User Info Sidebar */}
            <div className="w-full px-4 lg:w-1/3">
              <div className="shadow-three dark:bg-gray-dark mb-10 rounded-sm bg-white p-8">
                <div className="mb-8 flex flex-col items-center">
                  <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-primary/20">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="bg-primary/10 flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
                        {user.displayName?.[0] || user.email?.[0]}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="w-full text-center">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary mb-3 w-full rounded-sm border bg-[#f8f8f8] px-4 py-2 text-center text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B]"
                        placeholder="Tu nombre completo"
                        required
                      />
                      <div className="flex justify-center gap-2">
                        <button
                          type="submit"
                          disabled={updateLoading}
                          className="text-primary text-sm font-bold hover:underline disabled:opacity-50"
                        >
                          {updateLoading ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="text-body-color text-sm font-bold hover:underline"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center">
                      <h4 className="text-dark text-xl font-bold dark:text-white">
                        {user.displayName || "Usuario"}
                      </h4>
                      <p className="text-body-color mb-3 text-sm">{user.email}</p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-primary text-sm font-semibold hover:underline"
                      >
                        Editar nombre
                      </button>
                    </div>
                  )}
                </div>
                <div className="border-t border-body-color/10 pt-8 dark:border-white/10">
                  <Link
                    href="/calculator"
                    className="bg-primary hover:bg-primary/90 mb-4 block w-full rounded-sm px-6 py-3 text-center text-base font-medium text-white transition duration-300"
                  >
                    Nuevo Diagnóstico
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
                        window.location.href = "/";
                        setTimeout(() => {
                          // El logout se maneja vía AuthContext, pero forzamos el redirect primero para evitar parpadeos
                        }, 100);
                      }
                    }}
                    className="text-body-color hover:text-red-500 mt-4 block w-full text-center text-sm font-medium transition duration-300"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>



            {/* Diagnostics List */}
            <div className="w-full px-4 lg:w-2/3">
              <div className="shadow-three dark:bg-gray-dark rounded-sm bg-white p-8">
                <h3 className="text-dark mb-8 text-2xl font-bold dark:text-white">
                  Tus Proyectos y Diagnósticos
                </h3>

                {diagnostics.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="mb-4 flex justify-center text-primary">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <p className="text-body-color mb-8 text-lg">
                      Aún no has realizado ningún diagnóstico técnico o comercial.
                    </p>
                    <Link
                      href="/calculator"
                      className="bg-primary hover:bg-primary/90 inline-block rounded-sm px-8 py-3 text-base font-medium text-white transition duration-300"
                    >
                      Empezar Primer Diagnóstico
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {diagnostics.map((diag) => (
                      <div
                        key={diag.id}
                        className="border-body-color/10 dark:border-white/10 relative rounded-sm border p-6 transition duration-300 hover:shadow-md"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h4 className="text-dark mb-1 text-xl font-bold dark:text-white">
                              {diag.profile?.title || "Proyecto sin título"}
                            </h4>
                            <p className="text-body-color text-sm">
                              {diag.profile?.org || "Sin Organización"} | {new Date(diag.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-bold">
                              {diag.summary?.pct}% Madurez
                            </div>
                            <button
                              onClick={() => handleDeleteDiagnostic(diag.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Eliminar proyecto
                            </button>
                          </div>
                        </div>
                        <p className="text-body-color mb-6 line-clamp-2 text-base">
                          {diag.profile?.description || "Sin descripción proporcionada."}
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <Link
                            href={`/diagnosis/${diag.id}`}
                            className="bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-sm px-4 py-2 text-sm font-medium transition duration-300"
                          >
                            Ver Detalles
                          </Link>
                          {/* Aquí podrías añadir un botón para descargar el reporte PDF si el state lo permite */}
                        </div>
                      </div>
                    ))}

                    <div className="mt-10 border-t border-body-color/10 pt-8 dark:border-white/10">
                      <Link
                        href="/calculator"
                        className="bg-primary hover:bg-primary/90 flex items-center justify-center rounded-sm px-8 py-3 text-base font-medium text-white transition duration-300"
                      >
                        <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Agregar Nuevo Proyecto
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfilePage;
