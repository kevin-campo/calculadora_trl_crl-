"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail, signInWithGoogle, signInWithGithub } from "../../../backend/auth";
import { useAuth } from "@/context/AuthContext";
import { userActions } from "../../../backend/crud";
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

const SigninPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error("Por favor ingresa tu email y contraseña");
      }
      const user = await signInWithEmail(formData.email, formData.password);
      
      // Obtener datos del usuario desde Firestore para verificar el rol
      const profile = await userActions.getById(user.uid);
      if (profile && profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    setError("");
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      const profile = await userActions.getById(user.uid);
      if (profile && profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-[#f8faff] dark:bg-black overflow-hidden px-4 pt-32 pb-20 transition-colors duration-300">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1000px] animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-3xl rounded-[40px] shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* Lado Izquierdo: Información TRL/CRL */}
            <div className="w-full lg:w-1/2 bg-[#0A0F2D] p-10 sm:p-14 text-white relative overflow-hidden flex flex-col justify-center border-r border-white/5">
              {/* Efectos de Iluminación Suave */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 -mr-64 -mt-64 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 -ml-64 -mb-64 rounded-full blur-[100px]"></div>
              
              <div className="relative z-10">
                <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck size={28} className="text-white" />
                  </div>
                  <span className="text-2xl font-black tracking-tighter uppercase italic">TRL <span className="text-blue-200 not-italic">CRL</span></span>
                </Link>
                
                <h2 className="text-4xl font-black mb-6 leading-tight tracking-tight">Mide la Madurez de tu Innovación</h2>
                <p className="text-blue-100 text-lg font-medium mb-10 leading-relaxed">
                  Nuestra plataforma utiliza los marcos TRL y CRL para darte una visión clara del estado de tu proyecto.
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                      <span className="font-black text-xl">T</span>
                    </div>
                    <div>
                      <h4 className="font-black text-lg">Tecnología (TRL)</h4>
                      <p className="text-blue-100/80 text-sm leading-relaxed">Mide el progreso técnico, desde la idea básica hasta el sistema probado en entornos reales.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                      <span className="font-black text-xl">C</span>
                    </div>
                    <div>
                      <h4 className="font-black text-lg">Comercial (CRL)</h4>
                      <p className="text-blue-100/80 text-sm leading-relaxed">Evalúa la preparación del mercado y la viabilidad del modelo de negocio de tu solución.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lado Derecho: Formulario */}
            <div className="w-full lg:w-1/2 p-10 sm:p-14 lg:p-16 flex flex-col justify-center bg-white dark:bg-transparent">
              <div className="mb-10">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Iniciar Sesión</h3>
                <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">Accede a tus reportes y diagnósticos</p>
              </div>

              {error && (
                <div className="mb-8 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold animate-in bounce-in">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleSignin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm font-black hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-xl active:scale-[0.97] disabled:opacity-50 cursor-pointer mb-8"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                </svg>
                Entrar con Google
              </button>

              <div className="relative flex items-center gap-4 mb-8">
                <div className="flex-1 h-[1px] bg-gray-200 dark:bg-white/10"></div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">o bien</span>
                <div className="flex-1 h-[1px] bg-gray-200 dark:bg-white/10"></div>
              </div>

              <form onSubmit={handleSignin} className="space-y-6">
                <div>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Correo electrónico"
                      className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 pl-12 pr-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Contraseña"
                      className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 pl-12 pr-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 group active:scale-[0.97] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Iniciar Sesión
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/signup" className="text-blue-600 font-black hover:text-blue-500 ml-1 transition-colors underline-offset-4 hover:underline">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SigninPage;
