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
        {boldText && <strong className="text-black">{boldText}: </strong>}
        {text}
      </span>
    </div>
  );

  return (
    <section id="about" className="pt-16 md:pt-20 lg:pt-28 bg-[#f9fcff]">
      <div className="container">
        <div className="pb-16 md:pb-20 lg:pb-28">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">

            {/* TRL Column */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-50/50 h-full transition-transform hover:-translate-y-1">
              <div className="mb-6">
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block border border-blue-100">
                  Tecnología
                </span>
                <h3 className="text-2xl font-bold text-[#090e34] mb-4">¿Qué es el TRL?</h3>
                <p className="text-body-color text-base leading-relaxed mb-6">
                  El **TRL (Technology Readiness Level)** es una escala global utilizada para medir la madurez de una tecnología durante sus fases de desarrollo.
                  Fue concebida por la NASA en los años 70 para gestionar el riesgo tecnológico en misiones espaciales.
                </p>
                <div className="space-y-4 mb-8">
                  <List boldText="Niveles 1-3" text="Investigación básica y formulación del concepto." />
                  <List boldText="Niveles 4-6" text="Desarrollo de prototipos y validación simulada." />
                  <List boldText="Niveles 7-9" text="Demostración en entorno real y certificación." />
                </div>

                {/* TRL Image Placeholder */}
                <div className="relative w-full aspect-[2/1] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 mt-auto">
                  <Image
                    src="/images/about/trl-scale.png"
                    alt="Escala TRL"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>
            </div>

            {/* CRL Column */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-green-50/50 h-full transition-transform hover:-translate-y-1">
              <div className="mb-6 flex flex-col h-full">
                <div>
                  <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block border border-green-100">
                    Comercialización
                  </span>
                  <h3 className="text-2xl font-bold text-[#090e34] mb-4">¿Qué es el CRL?</h3>
                  <p className="text-body-color text-base leading-relaxed mb-6">
                    El **CRL (Commercial Readiness Level)** evalúa qué tan preparada está una tecnología para generar ingresos y escalar comercialmente.
                  </p>
                  <div className="space-y-4 mb-8">
                    <List boldText="Nivel 1" text="Identificación de la necesidad y propuesta inicial." />
                    <List boldText="Nivel 3" text="Validación con Early Adopters." />
                    <List boldText="Nivel 5" text="Modelo probado y listo para expansión." />
                  </div>
                </div>

                {/* CRL Image Placeholder */}
                <div className="relative w-full aspect-[1/1.2] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 mt-auto">
                  <Image
                    src="/images/about/crl-scale.png"
                    alt="Escala CRL"
                    fill
                    className="object-contain p-4"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Sinergy Section */}
          <div className="bg-[#1d2144] rounded-3xl p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 -mr-32 -mt-32 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 -ml-32 -mb-32 rounded-full blur-[100px]"></div>

            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
              <div className="text-left">
                <h4 className="text-3xl font-bold mb-6">Sinergia Estratégica</h4>
                <p className="text-blue-100/90 text-lg leading-relaxed mb-6">
                  Muchos proyectos mueren en el famoso <strong className="text-white font-extrabold uppercase tracking-wide">"Valle de la Muerte"</strong>. Nuestra evaluación combinada te ayuda a cruzar este puente vinculando el desarrollo técnico con hitos comerciales reales.
                </p>
                <div className="flex flex-wrap gap-4">
                  <span className="bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-md">Reducción de Riesgo</span>
                  <span className="bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-md">Atracción de Inversión</span>
                  <span className="bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-md">Time-to-Market</span>
                </div>
              </div>
              <div className="bg-white/5 p-8 rounded-2xl backdrop-blur-md border border-white/10">
                <h5 className="font-bold mb-4 flex items-center gap-2 text-blue-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" /></svg>
                  Conceptos Relevantes
                </h5>
                <ul className="space-y-3 text-sm text-blue-100/80">
                  <li>• <strong className="text-white">SINACYT</strong>: Sistema Nacional de Ciencia, Tecnología e Innovación.</li>
                  <li>• <strong className="text-white">MVP</strong>: Producto Mínimo Viable para validación técnica rápida.</li>
                  <li>• <strong className="text-white">Entorno Relevante</strong>: Condiciones que simulan el uso real.</li>
                  <li>• <strong className="text-white">Spin-off</strong>: Alianzas para comercializar resultados de investigación.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSectionOne;
