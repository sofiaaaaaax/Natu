"use client";

import { useCallback, useEffect, useRef, useState } from "react";
// react-use 17.6 exporta useMotion (la versión actual de useDeviceMotion).
import { useMotion as useDeviceMotion } from "react-use";
import { Activity, AlertTriangle, Hand, ShieldCheck, Smartphone } from "lucide-react";
import { clamp } from "@/lib/seismic";

type PermissionState = "idle" | "requesting" | "active" | "denied" | "unsupported";

interface AccelerometerProps {
  /** Voltaje de referencia usado solo para la indicación visual. */
  threshold?: number;
  /** Se invoca con cada muestra de voltaje (0–5 V). */
  onVoltage: (voltage: number) => void;
}

interface MotionPermissionConstructor {
  requestPermission?: () => Promise<"granted" | "denied">;
}

export default function Accelerometer({ threshold = 2.5, onVoltage }: AccelerometerProps) {
  const motion = useDeviceMotion();

  const [voltage, setVoltage] = useState(0);
  const [sensitivity, setSensitivity] = useState(1.2);
  const [permission, setPermission] = useState<PermissionState>("idle");
  const [hasMotion, setHasMotion] = useState(false);
  const [manualActive, setManualActive] = useState(false);

  const manualTimer = useRef<number | null>(null);
  const manualPhase = useRef(0);
  const onVoltageRef = useRef(onVoltage);

  useEffect(() => {
    onVoltageRef.current = onVoltage;
  }, [onVoltage]);

  // En Android y escritorio el permiso no es necesario; en iOS sí.
  useEffect(() => {
    if (typeof DeviceMotionEvent === "undefined") {
      setPermission("unsupported");
      return;
    }

    const ctor = DeviceMotionEvent as unknown as MotionPermissionConstructor;
    if (typeof ctor.requestPermission !== "function") {
      setPermission("active");
    }
  }, []);

  // Convierte la aceleración en un voltaje de 0 a 5 V (misma escala del prototipo).
  useEffect(() => {
    if (permission !== "active" || manualActive) return;

    const acc = motion.acceleration;
    const gravity = motion.accelerationIncludingGravity;

    let x = 0;
    let y = 0;
    let z = 0;
    let detected = false;

    if (acc && (acc.x !== null || acc.y !== null || acc.z !== null)) {
      x = acc.x ?? 0;
      y = acc.y ?? 0;
      z = acc.z ?? 0;
      detected = true;
    } else if (
      gravity &&
      (gravity.x !== null || gravity.y !== null || gravity.z !== null)
    ) {
      // Si el navegador solo entrega aceleración con gravedad, se descuenta el reposo.
      const gx = gravity.x ?? 0;
      const gy = gravity.y ?? 0;
      const gz = gravity.z ?? 0;
      const magnitudeWithGravity = Math.sqrt(gx * gx + gy * gy + gz * gz);
      x = Math.abs(magnitudeWithGravity - 9.806);
      detected = true;
    }

    if (detected) setHasMotion(true);

    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const next =
      magnitude < 0.8 ? 0 : clamp(((magnitude - 0.8) / 15) * 5 * sensitivity, 0, 5);

    setVoltage(next);
    onVoltageRef.current(next);
  }, [motion, sensitivity, permission, manualActive]);

  const stopManual = useCallback(() => {
    if (manualTimer.current !== null) {
      window.clearInterval(manualTimer.current);
      manualTimer.current = null;
    }
    setManualActive(false);
    setVoltage(0);
    onVoltageRef.current(0);
  }, []);

  const startManual = useCallback(() => {
    if (manualTimer.current !== null) return;

    setManualActive(true);
    manualPhase.current = 0;
    manualTimer.current = window.setInterval(() => {
      manualPhase.current += 0.3;
      const next = clamp(3.5 + Math.sin(manualPhase.current) * 1.3, 0, 5);
      setVoltage(next);
      onVoltageRef.current(next);
    }, 30);
  }, []);

  useEffect(() => {
    return () => {
      if (manualTimer.current !== null) {
        window.clearInterval(manualTimer.current);
        manualTimer.current = null;
      }
    };
  }, []);

  async function requestPermission() {
    if (typeof DeviceMotionEvent === "undefined") {
      setPermission("unsupported");
      return;
    }

    const ctor = DeviceMotionEvent as unknown as MotionPermissionConstructor;
    if (typeof ctor.requestPermission !== "function") {
      setPermission("active");
      return;
    }

    setPermission("requesting");
    try {
      const result = await ctor.requestPermission();
      setPermission(result === "granted" ? "active" : "denied");
    } catch {
      setPermission("denied");
    }
  }

  const active = voltage >= threshold;
  const percent = clamp((voltage / 5) * 100, 0, 100);
  const thresholdPercent = clamp((threshold / 5) * 100, 0, 100);

  const statusText = active
    ? "🚨 ¡ALARMA DISPARADA EN PANTALLA!"
    : voltage > 0.4
      ? "Vibración detectada (bajo umbral)"
      : "REPOSO (sin movimiento)";

  const permissionLabel =
    permission === "active"
      ? hasMotion
        ? "Acelerómetro activo"
        : "Esperando movimiento"
      : permission === "requesting"
        ? "Solicitando permiso…"
        : permission === "denied"
          ? "Permiso denegado"
          : permission === "unsupported"
            ? "Sensor no disponible"
            : "Acelerómetro inactivo";

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        className={`rounded-3xl border bg-natu-green/45 p-6 text-center shadow-2xl backdrop-blur ${
          active ? "sensor-meter-active !border-red-400" : "border-natu-ochre/30"
        }`}
      >
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-natu-sage">
          Señal generada
        </p>
        <p className="sensor-voltage mt-2">
          {voltage.toFixed(2)}
          <span className="ml-1 text-[0.4em] font-bold text-natu-sage">V</span>
        </p>

        <div className="relative mt-5 h-4 overflow-hidden rounded-full border border-white/10 bg-black/35">
          <div
            className="h-full rounded-full bg-gradient-to-r from-natu-sage via-natu-ochre to-red-400 transition-[width] duration-75"
            style={{ width: `${percent}%` }}
          />
          <span
            className="absolute inset-y-0 w-0.5 bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.9)]"
            style={{ left: `${thresholdPercent}%` }}
            title={`Umbral de referencia: ${threshold.toFixed(1)} V`}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[0.62rem] font-semibold text-slate-400">
          <span>0 V</span>
          <span>umbral {threshold.toFixed(1)} V</span>
          <span>5 V</span>
        </div>

        <p
          className={`mt-3 min-h-[22px] text-sm font-bold ${
            active ? "animate-pulse text-red-400" : "text-natu-sage"
          }`}
        >
          {statusText}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="sensor-sensibilidad"
            className="text-xs font-bold text-slate-200"
          >
            Sensibilidad del sensor
          </label>
          <span className="rounded-full bg-natu-ochre/15 px-2 py-0.5 font-mono text-xs font-bold text-natu-ochre">
            {sensitivity.toFixed(1)}x
          </span>
        </div>
        <input
          id="sensor-sensibilidad"
          type="range"
          min={0.4}
          max={3}
          step={0.1}
          value={sensitivity}
          onChange={(event) => setSensitivity(Number(event.target.value))}
          className="mt-2 w-full accent-natu-ochre"
        />
      </div>

      <div className="mt-4 grid gap-2">
        {permission === "active" ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">
            <ShieldCheck size={18} />
            {permissionLabel}
          </div>
        ) : (
          <button
            type="button"
            onClick={requestPermission}
            disabled={permission === "requesting" || permission === "unsupported"}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-natu-ochre to-[#b88654] px-4 py-3.5 text-sm font-extrabold text-natu-dark transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {permission === "unsupported" ? <Smartphone size={18} /> : <Activity size={18} />}
            {permissionLabel}
          </button>
        )}

        <button
          type="button"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture?.(event.pointerId);
            startManual();
          }}
          onPointerUp={stopManual}
          onPointerCancel={stopManual}
          onContextMenu={(event) => event.preventDefault()}
          className={`flex touch-none select-none items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3.5 text-sm font-bold transition active:scale-[0.98] ${
            manualActive
              ? "border-red-400 bg-red-400/20 text-red-200"
              : "border-natu-ochre/60 bg-natu-ochre/10 text-natu-ochre"
          }`}
        >
          <Hand size={18} />
          {manualActive ? "Simulando sismo…" : "Mantén presionado para simular sismo"}
        </button>
      </div>

      {permission === "denied" && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[0.7rem] leading-5 text-amber-100">
          <AlertTriangle size={14} className="mt-0.5 flex-none" />
          El navegador bloqueó el acelerómetro. Puedes usar el botón táctil o habilitar el
          permiso de movimiento en los ajustes del sitio.
        </p>
      )}

      {permission === "unsupported" && (
        <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[0.7rem] leading-5 text-slate-300">
          Este navegador no expone el acelerómetro. Usa el botón táctil para probar la señal.
        </p>
      )}

      <p className="mt-4 text-center text-[0.68rem] leading-5 text-slate-400">
        La señal se mapea de 0 a 5 V y se envía al mapa y a la Diapositiva 8 por Supabase
        Realtime: mueve el teléfono y verás la misma traza en el computador. En iOS debes
        tocar primero “Habilitar acelerómetro” y aceptar el permiso.
      </p>
    </div>
  );
}
