"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  ArrowLeft,
  ExternalLink,
  Info,
  MapPinned,
  Radio,
  Wifi,
  WifiOff,
} from "lucide-react";
import Accelerometer from "@/components/Sensor/Accelerometer";
import {
  SENSOR_CHANNEL,
  SENSOR_EVENT,
  isSupabaseConfigured,
  supabase,
} from "@/lib/supabaseClient";
import type { MotionPayload, SensorStatus } from "@/lib/types";

const statusCopy: Record<SensorStatus, string> = {
  idle: "Modo demo local (sin Supabase)",
  connecting: "Conectando con Supabase…",
  connected: "Enlazado al mapa y a la Diapositiva 8",
  error: "Sin conexión con Realtime",
};

export default function SensorPage() {
  const [status, setStatus] = useState<SensorStatus>(
    isSupabaseConfigured ? "connecting" : "idle",
  );

  const channelRef = useRef<RealtimeChannel | null>(null);
  const connectedRef = useRef(false);
  const lastSendRef = useRef(0);

  useEffect(() => {
    if (!supabase) {
      setStatus("idle");
      return;
    }

    const channel = supabase.channel(SENSOR_CHANNEL);

    channel.subscribe((state) => {
      const value = state as string;
      if (value === "SUBSCRIBED") {
        connectedRef.current = true;
        setStatus("connected");
      } else if (value === "CHANNEL_ERROR" || value === "TIMED_OUT") {
        connectedRef.current = false;
        setStatus("error");
      } else {
        connectedRef.current = false;
        setStatus("connecting");
      }
    });

    channelRef.current = channel;

    return () => {
      connectedRef.current = false;
      channelRef.current = null;
      if (supabase) supabase.removeChannel(channel);
    };
  }, []);

  const handleVoltage = useCallback((value: number) => {
    const now = Date.now();
    // Máximo ~40 Hz para no saturar el canal.
    if (now - lastSendRef.current < 25) return;
    lastSendRef.current = now;

    const channel = channelRef.current;
    if (!channel || !connectedRef.current) return;

    const payload: MotionPayload = { v: value, t: now };
    void channel.send({ type: "broadcast", event: SENSOR_EVENT, payload });
  }, []);

  const statusClass =
    status === "connected"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      : status === "error"
        ? "border-red-400/30 bg-red-400/10 text-red-200"
        : status === "connecting"
          ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
          : "border-white/15 bg-white/5 text-slate-300";

  return (
    <div className="sensor-shell min-h-[calc(100vh-64px)] px-4 py-8 text-slate-100 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <header className="text-center">
          <span className="inline-block rounded-full border border-natu-ochre/60 bg-natu-ochre/15 px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-natu-ochre">
            Proyecto NATU · ABP
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-white">Sensor sísmico</h1>
          <p className="mt-1 text-sm font-semibold text-natu-sage">
            Acelerómetro móvil en tiempo real
          </p>
        </header>

        <div
          className={`mx-auto mt-5 flex max-w-xs items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${statusClass}`}
        >
          {status === "connected" ? (
            <Wifi size={14} />
          ) : status === "error" || status === "idle" ? (
            <WifiOff size={14} />
          ) : (
            <Radio size={14} className="animate-pulse" />
          )}
          {statusCopy[status]}
        </div>

        <div className="mt-6">
          <Accelerometer onVoltage={handleVoltage} threshold={2.5} />
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-[0.78rem] leading-6 text-slate-300">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-white">
            <Info size={16} className="text-natu-ochre" />
            Cómo probarlo
          </h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Abre el mapa o la Diapositiva 8 en el computador y pulsa “Celular”.</li>
            <li>Escanea el código QR con la cámara del teléfono.</li>
            <li>Habilita el acelerómetro y sacude suavemente el dispositivo.</li>
            <li>El sismograma del mapa, la Diapositiva 8 y la alarma responderán en vivo.</li>
          </ol>
          <p className="mt-2 text-[0.7rem] text-slate-400">
            Si el acelerómetro no está disponible, mantén presionado el botón de simulación
            táctil para generar la señal igualmente.
          </p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link
            href="/mapa"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-natu-ochre px-4 py-3 text-sm font-extrabold text-natu-dark transition hover:bg-[#e0b487]"
          >
            <MapPinned size={16} />
            Ir al mapa
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
          <a
            href="/Exposicion/Expo11-18-2025/Expo.html#slide-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-natu-ochre/50 bg-natu-ochre/15 px-4 py-3 text-sm font-extrabold text-natu-ochre transition hover:bg-natu-ochre hover:text-natu-dark sm:col-span-2"
          >
            <ExternalLink size={16} />
            Ver Diapositiva 8 (Expo.html)
          </a>
        </div>

        <p className="mt-6 text-center text-[0.68rem] leading-5 text-slate-500">
          Proyecto académico NATU · La información no sustituye los reportes oficiales del
          SGC.{" "}
          <a
            href="/Exposicion/Expo11-18-2025/Expo.html#slide-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-natu-sage hover:text-natu-ochre"
          >
            Ver Diapositiva 8
            <ExternalLink size={10} />
          </a>
        </p>
      </div>
    </div>
  );
}
