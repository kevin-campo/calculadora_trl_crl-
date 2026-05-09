"use client";

import dynamic from "next/dynamic";

const Calculator = dynamic(() => import("./index"), {
  loading: () => (
    <div className="h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Cargando calculadora...</p>
      </div>
    </div>
  ),
  ssr: false,
});

export default function CalculatorWrapper() {
  return <Calculator />;
}
