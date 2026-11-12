"use client";

import { ToggleLeft } from "lucide-react";

interface TransistorLoopProps {
  signal: number;
  threshold: number;
  alarm: boolean;
}

export default function TransistorLoop({ signal, threshold, alarm }: TransistorLoopProps) {
  const conduce = Math.abs(signal) >= threshold;

  return (
    <div className="proto-panel">
      <h3 className="flex items-center gap-2">
        <ToggleLeft size={16} className="text-indigo-600" />
        Transistor: la señal se vuelve 1/0
      </h3>

      <svg
        className="mx-auto block h-auto max-h-[250px] w-full max-w-[360px]"
        viewBox="0 0 320 230"
        role="img"
        aria-label="Transistor NPN como interruptor de la alarma"
      >
        <path
          d="M45 30 H198 M45 30 V85 M45 115 V200 H198"
          fill="none"
          stroke="#64748b"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path
          d="M198 30 V46 M198 68 V85"
          fill="none"
          stroke="#64748b"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <line x1={33} y1={91} x2={57} y2={91} stroke="#f59e0b" strokeWidth={3} />
        <line x1={38} y1={102} x2={52} y2={102} stroke="#f59e0b" strokeWidth={3} />
        <text x={62} y={96} fill="#f59e0b" fontSize={11} fontFamily="Montserrat, sans-serif">
          +
        </text>

        <circle
          cx={198}
          cy={57}
          r={20}
          fill="#f87171"
          opacity={conduce ? 1 : 0}
          className="transition-opacity duration-200"
        />
        <circle
          cx={198}
          cy={57}
          r={11}
          fill={conduce ? "#f43f5e" : "#cbd5e1"}
          stroke="#94a3b8"
          strokeWidth={2}
          className="transition-colors duration-200"
        />
        <text
          x={222}
          y={61}
          fill="#475569"
          fontSize={9}
          fontWeight={700}
          fontFamily="Montserrat, sans-serif"
        >
          ALARMA
        </text>

        <circle cx={175} cy={140} r={38} fill="none" stroke="#94a3b8" strokeWidth={2} />
        <line
          x1={158}
          y1={120}
          x2={158}
          y2={160}
          stroke="#f59e0b"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <line
          x1={95}
          y1={140}
          x2={158}
          y2={140}
          stroke="#64748b"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path
          d="M158 131 L198 108 V85"
          fill="none"
          stroke="#64748b"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path
          d="M158 149 L198 172 V200"
          fill="none"
          stroke="#64748b"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path d="M191 165 L199 171 L190 175 Z" fill="#f59e0b" />
        <rect
          x={55}
          y={131}
          width={40}
          height={18}
          rx={3}
          fill="rgba(102, 126, 234, 0.12)"
          stroke="#667eea"
          strokeWidth={1.8}
        />
        <text
          x={75}
          y={143}
          textAnchor="middle"
          fill="#4f46e5"
          fontSize={6.5}
          fontWeight={700}
          fontFamily="Montserrat, sans-serif"
        >
          SENSOR
        </text>
        <text
          x={112}
          y={132}
          fill="#475569"
          fontSize={12}
          fontWeight={700}
          fontFamily="Montserrat, sans-serif"
        >
          B
        </text>
        <text
          x={207}
          y={102}
          fill="#475569"
          fontSize={12}
          fontWeight={700}
          fontFamily="Montserrat, sans-serif"
        >
          C
        </text>
        <text
          x={207}
          y={193}
          fill="#475569"
          fontSize={12}
          fontWeight={700}
          fontFamily="Montserrat, sans-serif"
        >
          E
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="proto-readout">
          <span className="r-label">Señal del sensor</span>
          <span className="r-value">
            {signal >= 0 ? "+" : ""}
            {signal.toFixed(2)} V
          </span>
        </div>
        <div className={`proto-readout ${conduce ? "alarm" : ""}`}>
          <span className="r-label">Salida digital</span>
          <span className="r-value">{conduce ? "1 · SATURACIÓN" : "0 · CORTE"}</span>
        </div>
        <div className={`proto-readout ${alarm ? "alarm" : ""}`}>
          <span className="r-label">Alarma (fijada)</span>
          <span className="r-value">{alarm ? "ACTIVADA" : "APAGADA"}</span>
        </div>
        <div className="proto-readout">
          <span className="r-label">Corriente de colector</span>
          <span className="r-value">{conduce ? "20.0 mA" : "0.0 mA"}</span>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Si la señal supera el umbral ({threshold.toFixed(1)} V), el transistor conduce (
        <strong className="text-slate-700">1</strong>) y enciende la alarma; por debajo queda en{" "}
        <strong className="text-slate-700">corte (0)</strong>. La alarma sigue fijada hasta
        Reiniciar.
      </p>
    </div>
  );
}
