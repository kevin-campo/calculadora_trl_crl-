import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto | TRL y CRL",
  description: "Ponte en contacto con nuestro equipo para recibir asesoría sobre el diagnóstico de tus proyectos.",
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Contáctanos"
        description="Estamos aquí para brindarte asesoría técnica personalizada sobre el uso de la plataforma y la interpretación de los niveles de madurez TRL y CRL."
      />

      <Contact />
    </>
  );
};

export default ContactPage;
