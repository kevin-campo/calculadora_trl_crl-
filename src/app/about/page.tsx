import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Breadcrumb from "@/components/Common/Breadcrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Page | Free Next.js Template for Startup and SaaS",
  description: "This is About Page for Startup Nextjs Template",
  // other metadata
};

const AboutPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Calculadora de nivel de madurez"
        description="La presente calculadora es una adaptación de cálculo del Nivel de Madurez Tecnológica (TRL) tomado de La Autoridad de Investigación y Desarrollo de Energía del Estado de Nueva York o NYSERDA, del Programa Marco de Investigación e Innovación de la Unión Europea Horizonte 2020 y la Administración Nacional de Aeronáutica y el Espacio o NASA. Tiene como objetivo dar a conocer de manera práctica y personalizada el nivel o estado de madurez tecnológica para proyectos de I+D en empresas, universidades, centros de investigación y/o entidades vinculadas al SINACYT.
La calculadora, además, cuenta con un complemento  para propuestas que posean  un nivel de TRL elevado y requieran evaluar aspectos referidos a la comercialización o mercado, medidos por la escala de Niveles de Madurez Comercial (CRL).
Para cada componente analizado, debe seleccionar la opción que mejor se adapte al estado de su producto/innovación. La calculadora determinará el nivel apropiado de TRL en función a sus respuestas. Similar procedimiento se aplica para evaluar el complemento de CRL. Debe considerar que este resultado es referencial y espera continuar su validación con la puesta en práctica en el SINACYT."
      />
      <AboutSectionOne />
      <AboutSectionTwo />
    </>
  );
};

export default AboutPage;
