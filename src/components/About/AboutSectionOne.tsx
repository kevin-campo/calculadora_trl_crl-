import Image from "next/image";
import SectionTitle from "../Common/SectionTitle";

const checkIcon = (
  <svg width="16" height="13" viewBox="0 0 16 13" className="fill-current">
    <path d="M5.8535 12.6631C5.65824 12.8584 5.34166 12.8584 5.1464 12.6631L0.678505 8.1952C0.483242 7.99994 0.483242 7.68336 0.678505 7.4881L2.32921 5.83739C2.52467 5.64193 2.84166 5.64216 3.03684 5.83791L5.14622 7.95354C5.34147 8.14936 5.65859 8.14952 5.85403 7.95388L13.3797 0.420561C13.575 0.22513 13.8917 0.225051 14.087 0.420383L15.7381 2.07143C15.9333 2.26669 15.9333 2.58327 15.7381 2.77854L5.8535 12.6631Z" />
  </svg>
);

const AboutSectionOne = () => {
  const List = ({ text, boldText = "" }) => (
    <div className="text-body-color mb-4 flex items-start text-base font-medium leading-relaxed">
      <span className="bg-primary/10 text-primary mr-3 mt-1 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md">
        {checkIcon}
      </span>
      <span>
        {boldText && <span className="text-black font-bold">{boldText}: </span>}
        {text}
      </span>
    </div>
  );

  return (
    <section id="about" className="pt-24 md:pt-32 lg:pt-40 bg-[#f9fcff]">
      <div className="container">
        <div className="pb-16 md:pb-20 lg:pb-28">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">

            {/* TRL Column */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-blue-50/50 h-full flex flex-col transition-all hover:shadow-xl group">
              <div className="mb-6 flex-1">
                <span className="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block border border-blue-100">
                  Madurez Tecnológica
                </span>
                <h3 className="text-2xl font-bold text-[#090e34] mb-4 group-hover:text-primary transition-colors">¿Qué es el TRL?</h3>
                <p className="text-body-color text-base leading-relaxed mb-8">
                  El TRL (Technology Readiness Level) es una escala global utilizada para medir la madurez de una tecnología durante sus fases de desarrollo, facilitando la gestión de riesgos técnicos.
                </p>

                {/* TRL Image */}
                <div className="mb-10 relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-[#fcfdfe]">
                  <Image
                    src="/images/crl_trl/trl.jpg"
                    alt="Escala TRL"
                    fill
                    className="object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-5">
                  <List boldText="Niveles 1-3" text="Investigación básica y formulación científica del concepto inicial." />
                  <List boldText="Niveles 4-6" text="Desarrollo de prototipos y validación en entornos controlados." />
                  <List boldText="Niveles 7-9" text="Demostración en entornos reales, certificación y operatividad final." />
                </div>
              </div>
            </div>

            {/* CRL Column */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-green-50/50 h-full flex flex-col transition-all hover:shadow-xl group">
              <div className="mb-6 flex-1">
                <span className="bg-green-50 text-green-600 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block border border-green-100">
                  Madurez Comercial
                </span>
                <h3 className="text-2xl font-bold text-[#090e34] mb-4 group-hover:text-green-600 transition-colors">¿Qué es el CRL?</h3>
                <p className="text-body-color text-base leading-relaxed mb-8">
                  El CRL (Commercial Readiness Level) evalúa la preparación de una tecnología para generar valor sostenible y escalar con éxito en mercados competitivos.
                </p>

                {/* CRL Image */}
                <div className="mb-10 relative w-full aspect-[4/5] max-h-[400px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-[#fcfdfe] mx-auto">
                  <Image
                    src="/images/crl_trl/crl.jpg"
                    alt="Escala CRL"
                    fill
                    className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-5">
                  <List boldText="Nivel 1" text="Identificación de la necesidad del mercado y propuesta de valor única." />
                  <List boldText="Nivel 3" text="Validación directa con clientes potenciales y adoptadores tempranos." />
                  <List boldText="Nivel 5" text="Modelo de negocio validado y preparación para expansión comercial." />
                </div>
              </div>
            </div>

          </div>

          {/* Sinergy Section - Redesigned */}
          <div className="bg-[#1d2144] rounded-[40px] p-10 md:p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 -mr-48 -mt-48 rounded-full blur-[120px]"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-3/5 text-left">
                <div className="w-16 h-1 bg-primary mb-8 rounded-full"></div>
                <h4 className="text-4xl font-bold mb-8 tracking-tight">Estrategia de Valor Integral</h4>
                <p className="text-blue-100/80 text-xl leading-relaxed mb-10">
                  Nuestra metodología ayuda a reducir la brecha del Valle de la Muerte, asegurando que la excelencia tecnológica se traduzca en una solución de mercado exitosa.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
                    <span className="block text-primary font-bold mb-1">Impacto</span>
                    <p className="text-sm text-blue-100/60">Reducción drástica del riesgo operativo.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
                    <span className="block text-primary font-bold mb-1">Escala</span>
                    <p className="text-sm text-blue-100/60">Atracción de inversión inteligente.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
                    <span className="block text-primary font-bold mb-1">Visión</span>
                    <p className="text-sm text-blue-100/60">Optimización del tiempo al mercado.</p>
                  </div>
                </div>
              </div>

              <div className="lg:w-2/5 w-full">
                <div className="bg-white/[0.03] p-10 rounded-[32px] backdrop-blur-xl border border-white/10 shadow-inner">
                  <h5 className="font-bold text-xl mb-6 text-white flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary text-sm">ⓘ</span>
                    Glosario de Innovación
                  </h5>
                  <ul className="space-y-6">
                    <li className="group">
                      <strong className="text-white block mb-1 group-hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">SINACYT</strong>
                      <p className="text-sm text-blue-100/60 leading-relaxed">Sistema Nacional de Ciencia, Tecnología e Innovación.</p>
                    </li>
                    <li className="group">
                      <strong className="text-white block mb-1 group-hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">MVP</strong>
                      <p className="text-sm text-blue-100/60 leading-relaxed">Producto Mínimo Viable para validación real inmediata.</p>
                    </li>
                    <li className="group">
                      <strong className="text-white block mb-1 group-hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">Valle de la Muerte</strong>
                      <p className="text-sm text-blue-100/60 leading-relaxed">Fase crítica entre el desarrollo y la comercialización.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSectionOne;
