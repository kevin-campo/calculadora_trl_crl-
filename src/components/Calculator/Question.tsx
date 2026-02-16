"use client";
import React from "react";

type Props = {
  id: string;
  title: string;
  options: string[];
  value: number | null;
  onChange: (v: number) => void;
};

const Question: React.FC<Props> = ({ id, title, options, value, onChange }) => {
  return (
    <div className="mb-6 border rounded bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-semibold text-lg text-black">{title}</h3>
      <div className="grid gap-2">
        {options.map((opt, idx) => (
          <label key={idx} className="flex items-start gap-3">
            <input
              type="radio"
              name={id}
              checked={value === idx + 1}
              onChange={() => onChange(idx + 1)}
              className="mt-1"
            />
            <div>
              <div className="text-sm font-medium text-black">{idx + 1}</div>
              <div className="text-sm text-black">{opt}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-3">
        <div className="text-sm font-medium text-black">Respuesta:</div>
        <div className="text-sm text-black mt-1">
          {value ? options[value - 1] : "No hay respuesta seleccionada"}
        </div>
      </div>
    </div>
  );
};

export default Question;
