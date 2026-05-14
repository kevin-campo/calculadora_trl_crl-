"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { companyActions } from "@/../backend/crud";

export type CompanyRecord = {
  id: string;
  userId?: string;
  companyName?: string;
  projectDescription?: string;
  ownerName?: string;
};

export type ProfileFromCompany = {
  org: string;
  title: string;
  description: string;
  ownerName: string;
};

type AuthUserLite = {
  uid: string;
  displayName?: string | null;
  name?: string;
  email?: string | null;
} | null;

type Props = {
  open: boolean;
  user: AuthUserLite;
  authLoading: boolean;
  onSelectCompany: (company: CompanyRecord, profile: ProfileFromCompany) => void;
  onGuestContinue: () => void;
  onClose: () => void;
};

/** Mapea documentos de Firestore; prioridad: iniciativa, lider, descripcion_adicional (convocatoria) */
export function normalizeCompanyDoc(raw: Record<string, unknown> & { id: string }): CompanyRecord {
  const d = raw;
  const companyName = String(
    d.iniciativa ??
      d.companyName ??
      d.organization ??
      d.org ??
      d.nombre ??
      d.empresa ??
      d.name ??
      d.nombreEmpresa ??
      d.razon_social ??
      d.razonSocial ??
      d.RazonSocial ??
      d.nombre_empresa ??
      d.NOMBRE_EMPRESA ??
      d["Nombre de la empresa"] ??
      d["Nombre empresa"] ??
      d.empresa_nombre ??
      ""
  ).trim();
  const projectDescription = String(
    d.descripcion_adicional ??
      d.projectDescription ??
      d.description ??
      d.descripcion ??
      d.project ??
      d.descripcionProyecto ??
      d.descripcion_proyecto ??
      d.DESCRIPCION_PROYECTO ??
      d["Descripción del proyecto"] ??
      d.nombre_proyecto ??
      d.NombreProyecto ??
      d.titulo_proyecto ??
      d.titulo ??
      d.Titulo ??
      ""
  ).trim();
  const ownerName = String(
    d.lider ??
      d.ownerName ??
      d.propietario ??
      d.owner ??
      d.ownerDisplayName ??
      d.nombrePropietario ??
      d.nombre_propietario ??
      d.NOMBRE_PROPIETARIO ??
      d["Nombre del propietario"] ??
      d.nombre_contacto ??
      d.NombreContacto ??
      d.contacto ??
      d.representante ??
      d.representante_legal ??
      ""
  ).trim();
  return {
    id: raw.id,
    userId: typeof d.userId === "string" ? d.userId : undefined,
    companyName: companyName || undefined,
    projectDescription: projectDescription || undefined,
    ownerName: ownerName || undefined,
  };
}

const CompanyPickerModal = ({
  open,
  user,
  authLoading,
  onSelectCompany,
  onGuestContinue,
  onClose,
}: Props) => {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [mode, setMode] = useState<"pick" | "create">("pick");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    projectDescription: "",
    ownerName: "",
  });

  useEffect(() => {
    if (!open || !user?.uid) return;

    setLoadingList(true);
    setLoadError(null);

    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = companyActions.subscribe(
        (data) => {
          const normalized = (data as Record<string, unknown>[]).map((doc) =>
            normalizeCompanyDoc({ ...doc, id: String(doc.id) })
          );
          setCompanies(normalized);
          setLoadingList(false);
        },
        () => {
          setLoadError(
            "No se pudo leer la colección «potenciales_4ta_convocatoria» en Firebase. Revisa reglas de seguridad y que la colección exista."
          );
          setLoadingList(false);
        }
      );
    } catch {
      setLoadError("No se pudo conectar con Firestore.");
      setLoadingList(false);
    }

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [open, user?.uid]);

  useEffect(() => {
    if (open && mode === "create" && user) {
      const def =
        user.displayName ||
        (user as { name?: string }).name ||
        user.email?.split("@")[0] ||
        "";
      setForm((f) => ({ ...f, ownerName: f.ownerName || def }));
    }
  }, [open, mode, user]);

  useEffect(() => {
    if (!open) {
      setMode("pick");
      setCreateError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    const companyName = form.companyName.trim();
    const projectDescription = form.projectDescription.trim();
    const ownerName = form.ownerName.trim();
    if (!companyName || !ownerName) {
      setCreateError("Iniciativa (nombre) y líder son obligatorios.");
      return;
    }
    setCreateError(null);
    setCreating(true);
    try {
      const created = await companyActions.create({
        userId: user.uid,
        iniciativa: companyName,
        lider: ownerName,
        descripcion_adicional: projectDescription,
      });
      const record: CompanyRecord = {
        id: created.id,
        userId: user.uid,
        companyName,
        projectDescription,
        ownerName,
      };
      const profile: ProfileFromCompany = {
        org: companyName,
        title: companyName,
        description: projectDescription,
        ownerName,
      };
      onSelectCompany(record, profile);
      setMode("pick");
      setForm({ companyName: "", projectDescription: "", ownerName: "" });
    } catch (err: unknown) {
      console.error(err);
      setCreateError("No se pudo crear la empresa. Intenta de nuevo.");
    } finally {
      setCreating(false);
    }
  };

  const applyCompany = (c: CompanyRecord) => {
    const n = normalizeCompanyDoc({ ...c, id: c.id } as Record<string, unknown> & { id: string });
    const name = (n.companyName || "").trim();
    const desc = (n.projectDescription || "").trim();
    const owner = (n.ownerName || "").trim();
    const profile: ProfileFromCompany = {
      org: name,
      title: name || "Proyecto",
      description: desc,
      ownerName: owner,
    };
    onSelectCompany(n, profile);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-picker-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-white/10 px-6 py-4 pr-14">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 id="company-picker-title" className="text-xl font-black text-gray-900 dark:text-white pr-2">
            {mode === "pick" ? "¿Para qué empresa es el diagnóstico?" : "Nuevo registro"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Lista en vivo desde Firestore (
            <code className="text-xs bg-gray-100 dark:bg-white/10 px-1 rounded break-all">
              potenciales_4ta_convocatoria
            </code>
            ). Iniciativa, líder y descripción adicional.
          </p>
        </div>

        <div className="p-6 pb-8">
          {authLoading ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Cargando sesión…</p>
            </div>
          ) : !user ? (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Si inicias sesión podrás guardar y reutilizar tus empresas en Firebase. También puedes continuar sin
                cuenta y rellenar los datos a mano.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signin"
                  className="flex-1 text-center py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <button
                  type="button"
                  onClick={onGuestContinue}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-white/15 text-gray-800 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Continuar sin cuenta
                </button>
              </div>
            </div>
          ) : mode === "pick" ? (
            <div className="space-y-4">
              {loadError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm px-4 py-3 font-medium">
                  {loadError}
                </div>
              )}
              {loadingList ? (
                <div className="flex justify-center py-10">
                  <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : companies.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm py-6">
                  No hay documentos en «potenciales_4ta_convocatoria» (o no tienes permiso de lectura). Puedes crear un
                  registro con el botón de abajo o revisar la consola de Firebase.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {companies.length} {companies.length === 1 ? "registro" : "registros"} en la base de datos
                  </p>
                  <ul className="space-y-2 max-h-[min(50vh,320px)] overflow-y-auto pr-1">
                  {companies.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => applyCompany(c)}
                        className="w-full text-left rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all"
                      >
                        <div className="font-bold text-gray-900 dark:text-white">
                          {c.companyName?.trim() || "Sin iniciativa"}
                        </div>
                        {c.ownerName && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-semibold">
                            Líder: {c.ownerName}
                          </div>
                        )}
                        {c.projectDescription && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                            {c.projectDescription}
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setCreateError(null);
                  setMode("create");
                }}
                className="w-full py-3 rounded-xl border-2 border-dashed border-blue-400 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              >
                + Crear nuevo registro
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              {createError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm px-4 py-2 font-medium">
                  {createError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                  Iniciativa (nombre) *
                </label>
                <input
                  required
                  value={form.companyName}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-100 dark:border-white/10 bg-white dark:bg-black/40 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Ej. InnovaTech S.A.S."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                  Descripción adicional
                </label>
                <textarea
                  rows={3}
                  value={form.projectDescription}
                  onChange={(e) => setForm((f) => ({ ...f, projectDescription: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-100 dark:border-white/10 bg-white dark:bg-black/40 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Breve descripción del producto o innovación"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                  Líder (propietario) *
                </label>
                <input
                  required
                  value={form.ownerName}
                  onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-100 dark:border-white/10 bg-white dark:bg-black/40 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Nombre y apellido"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("pick");
                    setCreateError(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/15 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Guardando…" : "Guardar y usar"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyPickerModal;
