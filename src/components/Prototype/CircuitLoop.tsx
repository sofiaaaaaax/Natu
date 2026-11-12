"use client";

import { CircuitBoard } from "lucide-react";

export type CircuitMode = "serie" | "paralelo";

interface CircuitLoopProps {
  mode: CircuitMode;
  onModeChange: (mode: CircuitMode) => void;
  alarm: boolean;
}

const R_LED = 330;
const R_BUZZER = 120;
const VOLTAGE = 9;

const cable = (d: string) => (
  <path d={d} fill="none" stroke="#64748b" strokeWidth={3} strokeLinecap="round" />
);

function Battery() {
  return (
    <g>
      <line x1={51} y1={124} x2={69} y2={124} stroke="#f59e0b" strokeWidth={3} />
      <line x1={55} y1={136} x2={65} y2={136} stroke="#f59e0b" strokeWidth={3} />
      <text x={74} y={129} fill="#f59e0b" fontSize={12} fontFamily="Montserrat, sans-serif">
        +
      </text>
    </g>
  );
}

function SensorSwitch({ active }: { active: boolean }) {
  const color = active ? "#f43f5e" : "#f59e0b";
  return (
    <g>
      <circle cx={140} cy={50} r={3} fill="#f59e0b" />
      <circle cx={180} cy={50} r={3} fill="#f59e0b" />
      <line
        x1={140}
        y1={50}
        x2={active ? 180 : 172}
        y2={active ? 50 : 32}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <text
        x={160}
        y={24}
        textAnchor="middle"
        fill={active ? "#dc2626" : "#475569"}
        fontSize={12}
        fontWeight={700}
        fontFamily="Montserrat, sans-serif"
      >
        SENSOR
      </text>
    </g>
  );
}

function Aviso({
  x,
  y,
  label,
  active,
  width = 56,
  height = 22,
}: {
  x: number;
  y: number;
  label: string;
  active: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <g>
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx={6}
        fill={active ? "rgba(244, 63, 94, 0.18)" : "rgba(148, 163, 184, 0.14)"}
        stroke={active ? "#f43f5e" : "#94a3b8"}
        strokeWidth={2}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill={active ? "#dc2626" : "#64748b"}
        fontSize={10}
        fontWeight={700}
        fontFamily="Montserrat, sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

export default function CircuitLoop({ mode, onModeChange, alarm }: CircuitLoopProps) {
  const resistencia = mode === "serie" ? R_LED + R_BUZZER : (R_LED * R_BUZZER) / (R_LED + R_BUZZER);
  const corriente = alarm ? VOLTAGE / resistencia : 0;

  return (
    <div className="proto-panel">
      <h3 className="flex items-center gap-2">
        <CircuitBoard size={16} className="text-amber-600" />
        Lazo de alarma: sensor → LED + buzzer
      </h3>

      <div className="proto-controls">
        <button
          type="button"
          onClick={() => onModeChange("serie")}
          className={`proto-btn ${mode === "serie" ? "proto-btn-active" : ""}`}
          aria-pressed={mode === "serie"}
        >
          Serie
        </button>
        <button
          type="button"
          onClick={() => onModeChange("paralelo")}
          className={`proto-btn ${mode === "paralelo" ? "proto-btn-active" : ""}`}
          aria-pressed={mode === "paralelo"}
        >
          Paralelo
        </button>
      </div>

      <svg
        className="block h-auto max-h-[250px] w-full"
        viewBox="0 0 520 240"
        role="img"
        aria-label={
          mode === "serie"
            ? "Circuito en serie con batería, sensor, LED y buzzer"
            : "Circuito en paralelo con batería, sensor, LED y buzzer"
        }
      >
        {mode === "serie" ? (
          <>
            {cable("M60 50 H140")}
            {cable("M180 50 H252")}
            {cable("M308 50 H332")}
            {cable("M388 50 H460")}
            {cable("M460 50 V190")}
            {cable("M60 190 H460")}
            {cable("M60 50 V110")}
            {cable("M60 150 V190")}
            <Battery />
            <SensorSwitch active={alarm} />
            <Aviso x={280} y={50} label="LED" active={alarm} />
            <Aviso x={360} y={50} label="BUZZER" active={alarm} />
          </>
        ) : (
          <>
            {cable("M60 50 H140")}
            {cable("M180 50 H460")}
            {cable("M460 50 V190")}
            {cable("M60 190 H460")}
            {cable("M60 50 V110")}
            {cable("M60 150 V190")}
            <Battery />
            <SensorSwitch active={alarm} />
            {cable("M320 50 V105")}
            {cable("M320 127 V190")}
            {cable("M400 50 V105")}
            {cable("M400 127 V190")}
            <Aviso x={320} y={116} label="LED" active={alarm} />
            <Aviso x={400} y={116} label="BUZZER" active={alarm} />
          </>
        )}
      </svg>

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="proto-readout">
          <span className="r-label">Sensor</span>
          <span className="r-value">{alarm ? "1 · SISMO" : "0 · REPOSO"}</span>
        </div>
        <div className="proto-readout">
          <span className="r-label">Corriente</span>
          <span className="r-value">{(corriente * 1000).toFixed(0)} mA</span>
        </div>
        <div className={`proto-readout ${alarm ? "alarm" : ""}`}>
          <span className="r-label">Alarma</span>
          <span className="r-value">{alarm ? "ACTIVADA" : "APAGADA"}</span>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {mode === "serie" ? (
          <>
            El sismógrafo cierra el lazo al superar el umbral. En{" "}
            <strong className="text-slate-700">serie</strong>, sensor y avisos comparten el mismo
            camino.
          </>
        ) : (
          <>
            En <strong className="text-slate-700">paralelo</strong>, cada aviso tiene su propia
            rama: todos reciben el mismo voltaje y se activan juntos.
          </>
        )}{" "}
        Resistencia equivalente: <strong className="text-slate-700">{resistencia.toFixed(0)} Ω</strong>.
      </p>
    </div>
  );
}
