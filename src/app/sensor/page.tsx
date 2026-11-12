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
  SENSOR_EVENT,
  isSupabaseConfigured,
  sensorChannelName,
  supabase,
} from "@/lib/supabaseClient";
import type { MotionPayload, SensorStatus } from "@/lib/types";

const statusCopy: Record<SensorStatus, string> = {
  idle: "Modo demo local (sin Supabase)",
  "no-account": "Sin cuenta: abre el QR de tu mapa",
  connecting: "Conectando con tu cuenta…",
  connected: "Enlazado solo a tu cuenta",
  error: "Sin conexión con Realtime",
};

export default function SensorPage() {
  const [status, setStatus] = useState<SensorStatus>(
    isSupabaseConfigured ? "connecting" : "idle",
  );
  const [scope, setScope] = useState<string | null>(null);
  const [scopeReady, setScopeReady] = useState(!isSupabaseConfigured);
  const [scopeLabel, setScopeLabel] = useState("");
  const [fromQr, setFromQr] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const connectedRef = useRef(false);
  const lastSendRef = useRef(0);

  // Canal propio: prioriza el `?canal=` del QR (funciona aunque el celular
  // no tenga sesión) y, si no viene, usa la sesión iniciada en el teléfono.
  useEffect(() => {
    if (!supabase) {
      setScopeReady(true);
      return;
    }

    let active = true;
    const params = new URLSearchParams(window.location.search);
    const canalQr = params.get("canal")?.trim();
    const usuarioQr = params.get("usuario")?.trim();

    if (canalQr) {
      setScope(canalQr);
      setScopeLabel(usuarioQr ? `@${usuarioQr}` : "QR del mapa");
      setFromQr(true);
      setScopeReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const user = data.session?.user;
      if (user) {
        setScope(user.id);
        setScopeLabel(
          `@${(user.user_metadata?.username as string | undefined) || user.email?.split("@")[0] || "usuario"}`,
        );
      } else {
        setScope(null);
        setScopeLabel("");
      }
      setScopeReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      const user = nextSession?.user;
      if (user) {
        setScope(user.id);
        setScopeLabel(
          `@${(user.user_metadata?.username as string | undefined) || user.email?.split("@")[0] || "usuario"}`,
        );
      } else {
        setScope(null);
        setScopeLabel("");
      }
      setScopeReady(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      setStatus("idle");
      return;
    }

    if (!scopeReady) {
      setStatus("connecting");
      return;
    }

    if (!scope) {
      connectedRef.current = false;
      channelRef.current = null;
      setStatus("no-account");
      return;
    }

    let active = true;
    setStatus("connecting");
    const channel = supabase.channel(sensorChannelName(scope));

    channel.subscribe((state) => {
      if (!active) return;
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
      active = false;
      connectedRef.current = false;
      channelRef.current = null;
      if (supabase) supabase.removeChannel(channel);
    };
  }, [scope, scopeReady]);

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
        : status === "no-account"
          ? "border-natu-ochre/40 bg-natu-ochre/10 text-natu-ochre"
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
          ) : status === "error" || status === "idle" || status === "no-account" ? (
            <WifiOff size={14} />
          ) : (
            <Radio size={14} className="animate-pulse" />
          )}
          {statusCopy[status]}
        </div>

        {status === "connected" && scopeLabel && (
          <p className="mx-auto mt-2 w-fit rounded-full bg-white/5 px-3 py-1 text-[0.68rem] font-bold text-slate-300">
            {fromQr ? "Canal del QR" : "Tu cuenta"}: {scopeLabel}
          </p>
        )}

        {status === "no-account" && (
          <div className="mt-4 rounded-2xl border border-natu-ochre/40 bg-natu-ochre/10 p-4 text-left text-[0.78rem] leading-6 text-amber-100">
            <p className="text-sm font-extrabold text-natu-ochre">
              Este sensor necesita una cuenta
            </p>
            <p className="mt-1">
              Abre el mapa desde tu cuenta, pulsa <strong>“Conectar celular”</strong> y escanea
              su código QR. También puedes iniciar sesión aquí y volver a cargar esta página.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-natu-ochre px-3 py-2 text-xs font-extrabold text-natu-dark transition hover:bg-[#e0b487]"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/mapa"
                className="inline-flex items-center justify-center rounded-lg border border-white/25 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Ir al mapa
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Accelerometer onVoltage={handleVoltage} threshold={2.5} />
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-[0.78rem] leading-6 text-slate-300">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-white">
            <Info size={16} className="text-natu-ochre" />
            Cómo probarlo
          </h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Inicia sesión en el computador y abre el mapa de tu cuenta.</li>
            <li>Pulsa “Conectar celular” y escanea tu código QR con el teléfono.</li>
            <li>Habilita el acelerómetro y sacude suavemente el dispositivo.</li>
            <li>El movimiento aparecerá solo en tu mapa y en tu Diapositiva 8.</li>
          </ol>
          <p className="mt-2 text-[0.7rem] text-slate-400">
            Cada cuenta tiene su propio canal: el movimiento de otros celulares no altera tu
            prototipo. Si el acelerómetro no está disponible, mantén presionado el botón de
            simulación táctil para generar la señal igualmente.
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
