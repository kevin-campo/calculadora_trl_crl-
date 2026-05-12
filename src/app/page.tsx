import Hero from "@/components/Hero";
import ScrollUp from "@/components/Common/ScrollUp";
import { Metadata } from "next";
import CalculatorWrapper from "@/components/Calculator/CalculatorWrapper";

export const metadata: Metadata = {
  title: "Calculadora de Madurez - TRL",
  description: "Herramienta para evaluar la madurez tecnológica y comercial de propuestas",
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <CalculatorWrapper />
    </>
  );
}
