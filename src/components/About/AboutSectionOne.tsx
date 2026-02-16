import Image from "next/image";
import SectionTitle from "../Common/SectionTitle";

const checkIcon = (
  <svg width="16" height="13" viewBox="0 0 16 13" className="fill-current">
    <path d="M5.8535 12.6631C5.65824 12.8584 5.34166 12.8584 5.1464 12.6631L0.678505 8.1952C0.483242 7.99994 0.483242 7.68336 0.678505 7.4881L2.32921 5.83739C2.52467 5.64193 2.84166 5.64216 3.03684 5.83791L5.14622 7.95354C5.34147 8.14936 5.65859 8.14952 5.85403 7.95388L13.3797 0.420561C13.575 0.22513 13.8917 0.225051 14.087 0.420383L15.7381 2.07143C15.9333 2.26669 15.9333 2.58327 15.7381 2.77854L5.8535 12.6631Z" />
  </svg>
);

const AboutSectionOne = () => {
  const List = ({ text }) => (
    <p className="text-body-color mb-5 flex items-center text-lg font-medium">
      <span className="bg-primary/10 text-primary mr-4 flex h-[30px] w-[30px] items-center justify-center rounded-md">
        {checkIcon}
      </span>
      {text}
    </p>
  );

  return (
    <section id="about" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="border-b border-body-color/[.15] pb-16 dark:border-white/[.15] md:pb-20 lg:pb-28">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-1/2">
              <SectionTitle
                title="¿Que es un TRL?"
                paragraph="El TRL (Technology Readiness Level), o Nivel de Madurez Tecnológica, es una metodología estandarizada que permite evaluar de forma sistemática el grado de desarrollo, validación y confiabilidad de una tecnología, producto o innovación. Su propósito principal es identificar en qué etapa del ciclo de vida tecnológico se encuentra un proyecto, desde una idea inicial hasta una solución completamente implementada y operativa en un entorno real.
                Este modelo fue desarrollado originalmente por la NASA y posteriormente adoptado y adaptado por diferentes organismos internacionales como la Unión Europea (Horizonte 2020) y NYSERDA, debido a su utilidad para la gestión de proyectos de investigación, desarrollo e innovación (I+D+i)."
                mb="44px"
              />

              <div
                className="mb-12 max-w-[570px] lg:mb-0"
                data-wow-delay=".15s"
              >
                <div className="mx-[-12px] flex flex-wrap">
                  <div className="w-full px-3 sm:w-1/2 lg:w-full xl:w-1/2">
                    <List text="Escala internacional TRL" />
                    <List text="Evaluación paso a paso" />
                    <List text="Resultados confiables" />
                  </div>

                  <div className="w-full px-3 sm:w-1/2 lg:w-full xl:w-1/2">
                    <List text="Apta para empresas y academia" />
                    <List text="Enfoque en I+D" />
                    <List text="Complemento comercial (CRL)" />
                  </div>
                </div>
              </div>
            </div>
            <SectionTitle
                title="¿Que es un CRL?"
                paragraph="El CRL (Commercial Readiness Level) o Nivel de Madurez Comercial es una metodología que permite evaluar qué tan preparada está una tecnología o innovación para ser llevada al mercado.
Mientras el TRL mide la madurez tecnológica, el CRL se enfoca en la madurez comercial, es decir, si existe un mercado real, clientes potenciales, un modelo de negocio viable y condiciones para la comercialización."
                mb="44px"
              />
                              <div className="mx-[-12px] flex flex-wrap">
                  <div className="w-full px-3 sm:w-1/2 lg:w-full xl:w-1/2">
                    <List text="Evalúa la madurez comercial" />
                    <List text="Análisis de mercado y clientes" />
                    <List text="Apoyo a la comercialización" />
                  </div>

                  <div className="w-full px-3 sm:w-1/2 lg:w-full xl:w-1/2">
                    <List text="Complemento del TRL" />
                    <List text="Orientado a innovación y emprendimiento" />
                    <List text="Valida la viabilidad comercial" />
                  </div>
                </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionOne;
