import Image from "next/image";

const AboutSectionTwo = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4 lg:w-1/2">
            <div className="relative mx-auto mb-12 aspect-[25/24] max-w-[500px] lg:m-0">
              <Image
                src="/images/about/about-image.svg"
                alt="Metodología TRL"
                fill
                className="drop-shadow-three dark:hidden"
              />
              <Image
                src="/images/about/about-image-dark.svg"
                alt="Metodología TRL"
                fill
                className="hidden drop-shadow-three dark:block"
              />
            </div>
          </div>
          <div className="w-full px-4 lg:w-1/2">
            <div className="max-w-[550px]">
              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl">
                  Metodología Probada
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Nuestra herramienta utiliza parámetros adaptados de organizaciones líderes como la **NASA**, la **Unión Europea (Horizonte 2020)** y **NYSERDA**. Esto garantiza que los resultados obtenidos tengan validez técnica y sean comparables a estándares internacionales.
                </p>
              </div>
              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl">
                  Enfoque Dual (TRL + CRL)
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  No nos detenemos en la técnica. Entendemos que para que un proyecto sea exitoso debe ser comercialmente viable. Por ello, integramos la escala CRL para evaluar tu preparación frente al mercado real.
                </p>
              </div>
              <div className="mb-1">
                <h3 className="mb-4 text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl">
                  Acceso Personalizado
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Diseñada para empresas, universidades y centros de investigación, nuestra calculadora ofrece un diagnóstico rápido que te ayuda a priorizar recursos y definir tu próxima gran etapa de desarrollo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionTwo;
