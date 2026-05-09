"use client";
import { useState } from "react";
import { db } from "@/../backend/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import emailjs from "@emailjs/browser";
import ContactInfoBox from "./ContactInfoBox";
import { 
  User, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Info,
  AlertTriangle,
  Trash2
} from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    showConfirm(
      "Enviar Mensaje",
      "¿Deseas enviar este mensaje a nuestro equipo de soporte?",
      async () => {
        setStatus("loading");
        try {
          // 1. Enviar correo vía EmailJS
          await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
            {
              name: formData.name,
              email: formData.email,
              message: formData.message,
            },
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
          );

          // 2. Guardar en Firestore
          try {
            await addDoc(collection(db, "contact_requests"), {
              ...formData,
              createdAt: serverTimestamp(),
            });
          } catch (dbError) {
            console.warn("Respaldo en DB falló:", dbError);
          }

          setStatus("success");
          addNotification("Mensaje enviado correctamente", "success");
          setFormData({ name: "", email: "", message: "" });
        } catch (error) {
          console.error("Error al enviar mensaje:", error);
          setStatus("error");
          addNotification("Error al enviar el mensaje", "error");
        }
      }
    );
  };

  return (
    <section id="contacto" className="bg-gray-50 dark:bg-gray-900 py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-7/12 xl:w-8/12">
            <div
              className="bg-white dark:bg-gray-800 rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="mb-10">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
                  ¿Necesitas Ayuda?
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Nuestro equipo de soporte técnico y comercial está listo para asesorarte.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                      <User size={14} className="text-blue-500" />
                      Tu Nombre
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej. Juan Pérez"
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                      <Mail size={14} className="text-blue-500" />
                      Tu Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                    <MessageSquare size={14} className="text-blue-500" />
                    Tu Mensaje
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    placeholder="Describe en qué podemos ayudarte..."
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white resize-none"
                  ></textarea>
                </div>

                <button
                  disabled={status === "loading"}
                  type="submit"
                  className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {status === "loading" ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  ) : (
                    <>
                      <Send size={18} />
                      Enviar Mensaje de Soporte
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          <div className="w-full lg:w-5/12 xl:w-4/12">
            <ContactInfoBox />
          </div>
        </div>
      </div>

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
              <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Soporte</span>
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
    </section>
  );
};

export default Contact;
