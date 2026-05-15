"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { diagnosticActions, messageActions } from "@/../backend/crud";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowRight,
  MessageSquare, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock, 
  Target,
  Building2,
  Calendar,
  User,
  Send
} from "lucide-react";

const MentorshipPage = ({ params }: { params: Promise<{ diagnosisId: string }> }) => {
  const { user, loading: authLoading } = useAuth();
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("routes");
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setDiagnosisId(resolvedParams.diagnosisId);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (diagnosisId) {
      fetchDiagnosis();
    }
  }, [diagnosisId]);

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (diagnosisId && activeTab === "chat") {
      const conversationId = diagnosisId; // Usar el ID del diagnóstico como ID de conversación
      
      const unsubscribe = messageActions.subscribeToConversation(conversationId, (msgs) => {
        const previousLength = messages.length;
        setMessages(msgs);
        
        // Mostrar indicador de escritura si el mentor está escribiendo
        const lastMessage = msgs[msgs.length - 1];
        if (lastMessage && lastMessage.senderId !== user?.uid && msgs.length > previousLength) {
          setShowTypingIndicator(true);
          setTimeout(() => setShowTypingIndicator(false), 2000);
        }
        
        // Sin auto-scroll automático para mantener la posición del usuario
      });
      
      unsubscribeRef.current = unsubscribe;
      
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [diagnosisId, activeTab, user?.uid, messages.length]);

  const fetchDiagnosis = async () => {
    try {
      setLoading(true);
      if (!diagnosisId) return;
      const data = await diagnosticActions.getById(diagnosisId);
      setDiagnosis(data);
    } catch (error) {
      console.error("Error al cargar diagnóstico:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const message = newMessage.trim();
    
    // Validaciones
    if (!message) return;
    if (!user || !diagnosisId) return;
    if (message.length > 2000) {
      alert("El mensaje es demasiado largo. Máximo 2000 caracteres.");
      return;
    }
    if (message.length < 1) {
      alert("El mensaje no puede estar vacío.");
      return;
    }

    setSendingMessage(true);
    try {
      await messageActions.create({
        conversationId: diagnosisId,
        senderId: user.uid,
        senderName: user.displayName || "Usuario",
        senderEmail: user.email,
        content: message,
        recipientId: "mentor",
        recipientName: "Mentor",
        diagnosisTitle: diagnosis?.profile?.title || "Diagnóstico",
        diagnosisOrg: diagnosis?.profile?.org || "Sin organización"
      });
      setNewMessage("");
      
      // Marcar mensajes del mentor como leídos
      messages.forEach(msg => {
        if (msg.senderId !== user.uid && !msg.read) {
          messageActions.markAsRead(msg.id);
        }
      });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("Error al enviar el mensaje. Por favor intenta nuevamente.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Indicador de escritura local
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
    }
    
    // Resetear timeout de escritura
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
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
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F2D] pt-32 pb-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Debes iniciar sesión para ver la mentoría.
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

  if (!diagnosis) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F2D] pt-32 pb-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Diagnóstico no encontrado
          </h2>
          <Link
            href="/profile"
            className="bg-primary hover:bg-primary/90 rounded-xl px-8 py-4 text-white font-bold transition-all"
          >
            Volver al Perfil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F2D] pb-20">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <Breadcrumb 
        pageName="Mentoría y Ruta de Maduración" 
        description="Plan personalizado para alcanzar la madurez tecnológica y comercial óptima"
      />

      <div className="container relative z-10 mt-8">
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Volver al Perfil
          </Link>
        </div>

        {/* Resumen del Diagnóstico */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                {diagnosis.profile?.title || "Proyecto sin título"}
              </h2>
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <Building2 size={16} />
                  {diagnosis.profile?.org || "Sin organización"}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(diagnosis.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-black text-primary">{diagnosis.summary?.pct || 0}%</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Madurez</div>
              </div>
              <div className="h-16 w-[1px] bg-slate-200 dark:bg-white/10"></div>
              <div className="text-center">
                <div className="text-4xl font-black text-blue-500">TRL {diagnosis.summary?.trlAvg ?? Math.ceil((diagnosis.summary?.pct || 0)/100*9)}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tecnológico</div>
              </div>
              <div className="h-16 w-[1px] bg-slate-200 dark:bg-white/10"></div>
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-500">CLR {diagnosis.summary?.clrAvg ?? Math.ceil((diagnosis.summary?.pct || 0)/100*5)}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Comercial</div>
              </div>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {diagnosis.profile?.description || "Sin descripción"}
          </p>
        </div>

        {/* Tabs de Navegación */}
        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab("routes")}
            className={`px-6 py-3 font-bold transition-all border-b-2 ${
              activeTab === "routes"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp size={18} className="inline mr-2" />
            Rutas de Maduración
          </button>
          <button
            onClick={() => setActiveTab("financing")}
            className={`px-6 py-3 font-bold transition-all border-b-2 ${
              activeTab === "financing"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <DollarSign size={18} className="inline mr-2" />
            Servicios de Mentoría
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-6 py-3 font-bold transition-all border-b-2 ${
              activeTab === "chat"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MessageSquare size={18} className="inline mr-2" />
            Comunicación con Mentor
          </button>
        </div>

        {/* Contenido de Tabs */}
        {activeTab === "routes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ruta Tecnológica */}
            <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-6 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Target size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                Ruta Tecnológica
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Investigación básica", status: "completed", date: "Completado" },
                  { title: "Prototipo de laboratorio", status: "in-progress", date: "En progreso" },
                  { title: "Validación técnica", status: "pending", date: "Pendiente" },
                  { title: "Escalado piloto", status: "pending", date: "Pendiente" },
                  { title: "Producción comercial", status: "pending", date: "Pendiente" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                    <div className={`mt-1 ${item.status === "completed" ? "text-emerald-500" : item.status === "in-progress" ? "text-primary" : "text-slate-400"}`}>
                      {item.status === "completed" ? <CheckCircle size={20} /> : item.status === "in-progress" ? <Clock size={20} /> : <Target size={20} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ruta de Maduración */}
            <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-6 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                  <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                Ruta de Maduración
              </h3>
              <div className="space-y-4">
                {[
                  { title: "TRL 1-2: Investigación", status: "completed", date: "Completado" },
                  { title: "TRL 3-4: Desarrollo", status: "in-progress", date: "En progreso" },
                  { title: "TRL 5-6: Validación", status: "pending", date: "Pendiente" },
                  { title: "TRL 7-8: Demostración", status: "pending", date: "Pendiente" },
                  { title: "TRL 9: Comercialización", status: "pending", date: "Pendiente" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                    <div className={`mt-1 ${item.status === "completed" ? "text-emerald-500" : item.status === "in-progress" ? "text-primary" : "text-slate-400"}`}>
                      {item.status === "completed" ? <CheckCircle size={20} /> : item.status === "in-progress" ? <Clock size={20} /> : <Target size={20} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ruta de Comercialización */}
            <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-6 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                  <Building2 size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                Ruta de Comercialización (CLR)
              </h3>
              <div className="space-y-4">
                {[
                  { title: "CLR 1: No preparado comercialmente", status: "completed", date: "Completado" },
                  { title: "CLR 2: Estrategia inicial", status: "in-progress", date: "En progreso" },
                  { title: "CLR 3: Prueba de mercado", status: "pending", date: "Pendiente" },
                  { title: "CLR 4: Preparado para escala", status: "pending", date: "Pendiente" },
                  { title: "CLR 5: Listo para mercado masivo", status: "pending", date: "Pendiente" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                    <div className={`mt-1 ${item.status === "completed" ? "text-emerald-500" : item.status === "in-progress" ? "text-primary" : "text-slate-400"}`}>
                      {item.status === "completed" ? <CheckCircle size={20} /> : item.status === "in-progress" ? <Clock size={20} /> : <Target size={20} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="p-4 bg-primary/10 rounded-2xl mb-6">
                <MessageSquare size={48} className="text-primary" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
                Comunicación con Mentor
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
                Para comunicarte con tu mentor y recibir asesoría personalizada sobre tu diagnóstico, por favor contáctanos a través de nuestro formulario de contacto.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl px-8 py-4 transition-all shadow-lg shadow-primary/20"
              >
                Ir a Formulario de Contacto
                <ArrowRight size={20} />
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                Respuesta garantizada en menos de 24 horas
              </p>
            </div>
          </div>
        )}

        {activeTab === "financing" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                  <DollarSign size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                Servicios de Mentoría
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                  <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Diagnóstico Inicial</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">$0</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Evaluación gratuita de madurez TRL/CRL</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                  <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Mentoría Básica</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">$500.000 COP</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Ruta de maduración personalizada (1 mes)</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                  <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Mentoría Premium</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">$1.500.000 COP</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Acompañamiento completo (3 meses)</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                Capacitaciones Especializadas
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Propiedad Intelectual", price: "$300.000 COP", duration: "2 horas", status: "available" },
                  { title: "Estrategia de Financiación", price: "$400.000 COP", duration: "3 horas", status: "available" },
                  { title: "Validación de Mercado", price: "$350.000 COP", duration: "2 horas", status: "available" },
                  { title: "Escalamiento Industrial", price: "$500.000 COP", duration: "4 horas", status: "available" },
                ].map((option, index) => (
                  <div key={index} className={`p-4 rounded-2xl border-2 ${
                    option.status === "recommended" 
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" 
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">{option.title}</h4>
                      {option.status === "recommended" && (
                        <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-1 rounded-full">Recomendado</span>
                      )}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{option.price}</span>
                      <span className="text-slate-600 dark:text-slate-400">{option.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MentorshipPage;
