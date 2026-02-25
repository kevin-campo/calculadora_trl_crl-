import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Breadcrumb from "@/components/Common/Breadcrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca de | TRL y CRL",
};

const AboutPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Acerca de la Metodología"
        description="Conoce los estándares internacionales TRL y CRL que sustentan nuestra herramienta de diagnóstico para proyectos de investigación, desarrollo e innovación."
      />
      <AboutSectionOne />
      <AboutSectionTwo />
    </>
  );
};

export default AboutPage;
