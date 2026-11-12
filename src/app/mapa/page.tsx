"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  Copy,
  Crosshair,
  ExternalLink,
  Gauge,
  MapPin,
  Play,
  QrCode,
  Radio,
  Ruler,
  Square,
  Timer,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import SeismicMap from "@/components/Map/SeismicMap";
import Seismograph from "@/components/Prototype/Seismograph";
import CircuitLoop, { type CircuitMode } from "@/components/Prototype/CircuitLoop";
import TransistorLoop from "@/components/Prototype/TransistorLoop";
import {
  SENSOR_CHANNEL,
  SENSOR_EVENT,
  getSiteUrl,
  isSupabaseConfigured,
  supabase,
} from "@/lib/supabaseClient";
import { clamp, classifyDepth, classifyMagnitude } from "@/lib/seismic";
import type { Epicenter, MotionPayload } from "@/lib/types";

type RealtimeStatus = "idle" | "connecting" | "connected" | "error";

const realtimeLabels: Record<RealtimeStatus, string> = {
  idle: "Modo demo · sin Supabase",
  connecting: "Conectando a Realtime…",
  connected: "Realtime conectado",
  error: "Realtime no disponible",
};

export default function MapaPage() {
  const [epicenter, setEpicenter] = useState<Epicenter | null>(null);
  const [coords, setCoords] = useState<Epicenter | null>(null);
  const [magnitude, setMagnitude] = useState(4.5);
  const [depth, setDepth] = useState(30);
  const [duration, setDuration] = useState(10);
  const [threshold, setThreshold] = useState(2.5);
  const [alarm, setAlarm] = useState(false);
  const [quake, setQuake] = useState<{
    id: number;
    intensity: number;
    duration: number;
  } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [waveTick, setWaveTick] = useState(0);
  const [waveClear, setWaveClear] = useState(0);
  const [circuitMode, setCircuitMode] = useState<CircuitMode>("serie");

  const [liveVoltage, setLiveVoltage] = useState<number | null>(null);
  const [liveTimestamp, setLiveTimestamp] = useState<number | null>(null);
  const liveTimestampRef = useRef<number | null>(null);
  const magnitudeRef = useRef(magnitude);
  const durationRef = useRef(duration);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    magnitudeRef.current = magnitude;
  }, [magnitude]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const [realtime, setRealtime] = useState<RealtimeStatus>(
    isSupabaseConfigured ? "connecting" : "idle",
  );
  const [showQr, setShowQr] = useState(false);
  const [sensorUrl, setSensorUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // URL pública del sensor para el código QR (solo en el navegador).
  useEffect(() => {
    setSensorUrl(`${getSiteUrl()}/sensor`);
  }, []);

  // Suscripción a las muestras del acelerómetro móvil.
  useEffect(() => {
    if (!supabase) return;

    let lastUi = 0;
    const channel = supabase.channel(SENSOR_CHANNEL);

    channel
      .on("broadcast", { event: SENSOR_EVENT }, ({ payload }) => {
        const data = payload as Partial<MotionPayload> | null;
        if (!data || typeof data.v !== "number") return;

        const now = Date.now();
        // Limita los re-renders del mapa sin perder la señal del sismógrafo.
        if (now - lastUi < 70) return;
        lastUi = now;

        liveTimestampRef.current = now;
        setLiveVoltage(clamp(data.v, 0, 5));
        setLiveTimestamp(now);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setRealtime("connected");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setRealtime("error");
        else setRealtime("connecting");
      });

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, []);

  // Si el celular deja de enviar, vuelve al modo de simulación.
  useEffect(() => {
    const interval = window.setInterval(() => {
      const stamp = liveTimestampRef.current;
      if (stamp && Date.now() - stamp > 2000) {
        liveTimestampRef.current = null;
        setLiveTimestamp(null);
        setLiveVoltage(null);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  // Cada simulación genera una ráfaga de ondas y una sacudida breve del mapa.
  useEffect(() => {
    if (!quake) {
      setShaking(false);
      return;
    }

    setShaking(true);
    // La duración se captura al iniciar la simulación para que el mapa y el
    // sismógrafo terminen exactamente al mismo tiempo.
    const seconds = clamp(quake.duration, 1, 60);
    const intervalMs = magnitudeRef.current > 6 ? 300 : 500;

    if (epicenter) setWaveTick((tick) => tick + 1);

    const waveInterval = epicenter
      ? window.setInterval(() => setWaveTick((tick) => tick + 1), intervalMs)
      : null;
    const timer = window.setTimeout(() => {
      setShaking(false);
      if (waveInterval !== null) window.clearInterval(waveInterval);
    }, seconds * 1000);

    return () => {
      if (waveInterval !== null) window.clearInterval(waveInterval);
      window.clearTimeout(timer);
    };
  }, [quake, epicenter]);

  // Cierra el QR con la tecla Escape.
  useEffect(() => {
    if (!showQr) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setShowQr(false);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showQr]);

  const simulate = useCallback((intensity: number) => {
    setAlarm(false);
    setQuake({
      id: Date.now() + Math.random(),
      intensity: clamp(intensity, 0, 100),
      duration: clamp(durationRef.current, 1, 60),
    });
  }, []);

  const intensityFromMagnitude = clamp(Math.round(((magnitude - 2) / 4) * 100), 15, 100);

  function handleMapSimulate() {
    if (!epicenter) return;
    simulate(intensityFromMagnitude);
  }

  function handleReset() {
    setAlarm(false);
    setQuake(null);
    setResetKey((key) => key + 1);
  }

  function handleStop() {
    setAlarm(false);
    setQuake(null);
    setResetKey((key) => key + 1);
    setWaveClear((key) => key + 1);
  }

  async function copySensorUrl() {
    try {
      await navigator.clipboard.writeText(sensorUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const liveFresh =
    liveVoltage !== null && liveTimestamp !== null && Date.now() - liveTimestamp < 2000;
  const transistorSignal = liveFresh
    ? (liveVoltage as number)
    : alarm
      ? threshold + 0.6
      : 0;

  const realtimeClass =
    realtime === "connected"
      ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
      : realtime === "error"
        ? "border-red-300/40 bg-red-400/15 text-red-100"
        : realtime === "connecting"
          ? "border-amber-300/40 bg-amber-400/15 text-amber-100"
          : "border-white/20 bg-white/10 text-slate-200";

  return (
    <div className="bg-natu-light pb-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-natu-dark via-natu-green to-[#405c4c] text-white">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-natu-ochre/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <span className="natu-badge border-natu-ochre/50 bg-natu-ochre/15 text-natu-ochre">
            Simulador sísmico
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            Mapa interactivo de Colombia
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
            Marca un epicentro sobre el mapa, ajusta la magnitud y la profundidad, y observa
            el área de afectación con ondas sísmicas. El prototipo reacciona a cada simulación
            y al acelerómetro de tu celular en tiempo real.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${realtimeClass}`}
            >
              {realtime === "connected" ? (
                <Wifi size={14} />
              ) : realtime === "error" || realtime === "idle" ? (
                <WifiOff size={14} />
              ) : (
                <Radio size={14} className="animate-pulse" />
              )}
              {realtimeLabels[realtime]}
            </span>

            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white hover:text-natu-green"
            >
              <QrCode size={14} />
              Conectar celular
            </button>

            <Link
              href="/sensor"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white hover:text-natu-green"
            >
              <Radio size={14} />
              Abrir sensor
            </Link>

            <a
              href="/Exposicion/Expo11-18-2025/Expo.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white hover:text-natu-green"
            >
              Diapositivas
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-natu-soft">
          <div className="relative h-[540px] w-full sm:h-[580px]">
            <SeismicMap
              epicenter={epicenter}
              onEpicenter={setEpicenter}
              onCoords={setCoords}
              magnitude={magnitude}
              depth={depth}
              waveTick={waveTick}
              waveClear={waveClear}
              shaking={shaking}
            />

            <div className="pointer-events-none absolute left-3 top-3 z-[900] hidden rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur sm:block">
              <p className="font-extrabold uppercase tracking-wider text-slate-500">
                Coordenadas
              </p>
              <p className="mt-1 font-mono text-[0.72rem] font-bold text-slate-800">
                Lat: {coords ? coords.lat.toFixed(5) : "—"} · Lng:{" "}
                {coords ? coords.lng.toFixed(5) : "—"}
              </p>
              {epicenter && (
                <p className="mt-1 flex items-center gap-1 text-[0.68rem] font-bold text-rose-600">
                  <MapPin size={11} />
                  Epicentro: {epicenter.lat.toFixed(4)}, {epicenter.lng.toFixed(4)}
                </p>
              )}
            </div>

            <div className="absolute right-3 top-3 z-[900] w-[min(300px,calc(100%-1.5rem))] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                <Gauge size={16} className="text-rose-600" />
                Control de sismos
              </h2>

              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className="flex items-baseline justify-between gap-2 text-[0.7rem] font-bold text-slate-600">
                    <span>Magnitud (Richter)</span>
                    <span className="font-mono text-xs text-rose-600">{magnitude.toFixed(1)}</span>
                  </span>
                  <input
                    type="range"
                    min={2}
                    max={8.5}
                    step={0.1}
                    value={magnitude}
                    onChange={(event) => setMagnitude(Number(event.target.value))}
                    className="mt-1 w-full accent-rose-600"
                  />
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-orange-600">
                    {classifyMagnitude(magnitude)}
                  </span>
                </label>

                <label className="block">
                  <span className="flex items-baseline justify-between gap-2 text-[0.7rem] font-bold text-slate-600">
                    <span>Profundidad (km)</span>
                    <span className="font-mono text-xs text-rose-600">{depth}</span>
                  </span>
                  <input
                    type="range"
                    min={5}
                    max={700}
                    step={5}
                    value={depth}
                    onChange={(event) => setDepth(Number(event.target.value))}
                    className="mt-1 w-full accent-rose-600"
                  />
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-orange-600">
                    {classifyDepth(depth)}
                  </span>
                </label>

                <label className="flex items-center justify-between gap-2 text-[0.7rem] font-bold text-slate-600">
                  <span className="flex items-center gap-1">
                    <Timer size={12} />
                    Duración (s)
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={duration}
                    onChange={(event) =>
                      setDuration(clamp(Number(event.target.value) || 1, 1, 60))
                    }
                    className="w-16 rounded-md border border-slate-300 px-2 py-1 text-center text-xs font-bold text-slate-700 outline-none focus:border-rose-500"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={handleMapSimulate}
                  disabled={!epicenter}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 px-3 py-2 text-xs font-extrabold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play size={13} />
                  Simular sismo
                </button>
                <button
                  type="button"
                  onClick={handleStop}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-400"
                >
                  <Square size={12} />
                  Detener y reiniciar
                </button>
              </div>

              {!epicenter ? (
                <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-[0.68rem] font-semibold leading-4 text-amber-800">
                  <Crosshair size={13} className="mt-0.5 flex-none" />
                  Haz clic sobre el mapa para marcar el epicentro antes de simular.
                </p>
              ) : (
                <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-2 text-[0.68rem] font-semibold leading-4 text-emerald-800">
                  <Ruler size={13} className="mt-0.5 flex-none" />
                  Intensidad del prototipo: {intensityFromMagnitude}% · duración estimada{" "}
                  {duration} s.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="natu-card p-4">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-wider text-slate-500">
              Epicentro
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-800">
              {epicenter
                ? `${epicenter.lat.toFixed(4)}, ${epicenter.lng.toFixed(4)}`
                : "Sin marcar"}
            </p>
          </div>
          <div className="natu-card p-4">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-wider text-slate-500">
              Magnitud
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {magnitude.toFixed(1)} · {classifyMagnitude(magnitude)}
            </p>
          </div>
          <div className="natu-card p-4">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-wider text-slate-500">
              Profundidad
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {depth} km · {classifyDepth(depth)}
            </p>
          </div>
          <div className={`natu-card p-4 ${alarm ? "border-red-300 bg-red-50" : ""}`}>
            <p className="text-[0.65rem] font-extrabold uppercase tracking-wider text-slate-500">
              Alarma
            </p>
            <p
              className={`mt-1 flex items-center gap-1.5 text-sm font-bold ${
                alarm ? "text-red-600" : "text-slate-800"
              }`}
            >
              {alarm ? <AlertTriangle size={14} /> : <Activity size={14} />}
              {alarm ? "Activada (fijada)" : "En reposo"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600 shadow-natu-soft">
          <h2 className="mb-2 text-base font-extrabold text-natu-green">
            Cómo usar el simulador
          </h2>
          <ul className="grid list-disc gap-1.5 pl-5 sm:grid-cols-2">
            <li>Haz clic en el mapa para marcar el epicentro del sismo.</li>
            <li>Ajusta magnitud y profundidad para cambiar el área afectada.</li>
            <li>Presiona “Simular sismo” para propagar las ondas sísmicas.</li>
            <li>Observa cómo el prototipo fija la alarma al superar el umbral.</li>
            <li>Escanea el código QR y abre el sensor desde tu celular.</li>
            <li>Sacude el teléfono: la señal viaja por Supabase Realtime.</li>
          </ul>
        </div>

        <section id="prototipo" className="mt-10 scroll-mt-24">
          <div className="mb-5 max-w-3xl">
            <span className="natu-badge">Prototipo del proyecto</span>
            <h2 className="mt-3 text-2xl font-extrabold text-natu-green sm:text-3xl">
              Sismógrafo y alarma sísmica
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Así funciona el módulo físico: el sensor entrega una señal, el ADC la convierte
              en bits, el comparador la enfrenta al umbral y el biestable mantiene la alarma
              activa hasta reiniciar. También reacciona cuando simulas un sismo en el mapa o
              cuando el acelerómetro del celular detecta movimiento.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Seismograph
                liveVoltage={liveVoltage}
                liveTimestamp={liveTimestamp}
                threshold={threshold}
                onThresholdChange={setThreshold}
                alarm={alarm}
                onAlarm={() => setAlarm(true)}
                onReset={handleReset}
                onSimulate={simulate}
                intensity={intensityFromMagnitude}
                quake={quake}
                resetKey={resetKey}
              />
            </div>

            <CircuitLoop mode={circuitMode} onModeChange={setCircuitMode} alarm={alarm} />
            <TransistorLoop signal={transistorSignal} threshold={threshold} alarm={alarm} />
          </div>
        </section>
      </section>

      {showQr && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setShowQr(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-title"
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQr(false)}
              className="absolute right-3 top-3 rounded-full border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>

            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-natu-green/10 text-natu-green">
              <QrCode size={24} />
            </span>
            <h2 id="qr-title" className="mt-3 text-lg font-extrabold text-natu-green">
              Conecta tu celular
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Escanea el código con la cámara del teléfono. Debes abrir esta página desde una
              URL accesible por el móvil (misma red o Vercel).
            </p>

            <div className="mx-auto mt-4 w-fit rounded-xl border border-slate-200 bg-white p-3">
              {sensorUrl ? (
                <QRCodeSVG value={sensorUrl} size={190} level="M" />
              ) : (
                <div className="grid h-[190px] w-[190px] place-items-center text-xs text-slate-400">
                  Generando…
                </div>
              )}
            </div>

            <p className="mt-3 break-all rounded-lg bg-slate-100 px-3 py-2 font-mono text-[0.7rem] text-slate-600">
              {sensorUrl || "—"}
            </p>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={copySensorUrl}
                disabled={!sensorUrl}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-natu-green hover:text-natu-green disabled:opacity-50"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Enlace copiado" : "Copiar enlace"}
              </button>
              <Link
                href="/sensor"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-natu-green px-3 py-2 text-xs font-extrabold text-white transition hover:bg-natu-dark"
              >
                <Radio size={14} />
                Abrir sensor en este dispositivo
              </Link>
            </div>

            {!isSupabaseConfigured && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-left text-[0.68rem] font-semibold leading-4 text-amber-800">
                Supabase no está configurado: el sensor funcionará en modo local y el mapa no
                recibirá la señal. Revisa <code>README-DEPLOY.md</code>.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
