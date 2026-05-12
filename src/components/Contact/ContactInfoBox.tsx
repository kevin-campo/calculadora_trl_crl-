"use client";

import { useTheme } from "next-themes";

const ContactInfoBox = () => {
  const { theme } = useTheme();

  return (
    <div className="shadow-three dark:bg-gray-dark relative z-10 rounded-xl bg-white p-8 sm:p-11 lg:p-8 xl:p-11 overflow-hidden transition-all hover:shadow-xl border border-gray-100 dark:border-white/5">
      <h3 className="mb-6 text-2xl leading-tight font-bold text-black dark:text-white">
        Información de Contacto
      </h3>
      <p className="text-body-color border-body-color/10 mb-8 border-b pb-8 text-base leading-relaxed dark:border-white/10 italic">
        Contamos con un equipo técnico especializado para resolver tus dudas.
      </p>

      <div className="space-y-6">
        <div>
          <h4 className="text-primary font-bold text-sm uppercase tracking-wider mb-3">Acompañamiento en:</h4>
          <ul className="space-y-2">
            {[
              "Uso y navegación de la plataforma",
              "Interpretación de resultados TRL/CRL",
              "Aplicación metodológica en prototipos",
              "Consultas técnicas de I+D+i"
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-body-color text-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 space-y-4">
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
              <p className="text-sm font-bold text-black dark:text-white">contactotrlcrl@gmail.com</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Teléfono</p>
              <p className="text-sm font-bold text-black dark:text-white">(+57) 301 445 6354</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Horario</p>
              <p className="text-sm font-bold text-black dark:text-white">Lun - Vie: 8am - 5pm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background patterns */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="20" r="40" fill="currentColor" className="text-primary" />
        </svg>
      </div>
    </div>
  );
};

export default ContactInfoBox;
