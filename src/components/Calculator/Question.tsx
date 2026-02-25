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
    <div className="space-y-4">
      <div className="grid gap-4">
        {options.map((opt, idx) => {
          const isSelected = value === idx + 1;
          return (
            <label
              key={idx}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group ${isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-50 bg-gray-50 hover:border-blue-200 hover:bg-white"
                }`}
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name={id}
                  checked={isSelected}
                  onChange={() => onChange(idx + 1)}
                  className="w-5 h-5 cursor-pointer accent-blue-600"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 group-hover:bg-blue-100"
                    }`}>
                    Nivel {idx + 1}
                  </span>
                </div>
                <p className={`text-sm md:text-base transition-colors ${isSelected ? "text-blue-900 font-semibold" : "text-gray-700 font-medium"
                  }`}>
                  {opt}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {value && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
          <p className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-1">Tu selección actual:</p>
          <p className="text-sm text-blue-900 leading-relaxed font-medium">
            {options[value - 1]}
          </p>
        </div>
      )}
    </div>
  );
};

export default Question;
