"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Waves } from "lucide-react";

interface SeismographProps {
  liveVoltage: number | null;
  liveTimestamp: number | null;
  threshold: number;
  onThresholdChange: (value: number) => void;
  alarm: boolean;
  onAlarm: () => void;
  onReset: () => void;
  onSimulate: (intensity: number) => void;
  quake: { id: number; intensity: number } | null;
  resetKey: number;
}

interface Readout {
  peak: string;
  adc: string;
  comparator: string;
  counter: string;
}

const WINDOW_SECONDS = 6;

function peakOfPackage(amplitude: number): number {
  let max = 0;
  for (let d = 0; d <= 4; d += 0.005) {
    const value = Math.abs(amplitude * Math.exp(-d / 1.1) * Math.sin(2 * Math.PI * 1.6 * d));
    if (value > max) max = value;
  }
  return max;
}

function adcLevel(value: number, bits: number, live: boolean): number {
  const levels = Math.pow(2, bits);
  const normalized = live ? value / 5 : (value + 5) / 10;
  return Math.min(levels - 1, Math.max(0, Math.round(normalized * (levels - 1))));
}

function toBinary(value: number, bits: number): string {
  return adcLevel(value, bits, false).toString(2).padStart(bits, "0");
}

export default function Seismograph({
  liveVoltage,
  liveTimestamp,
  threshold,
  onThresholdChange,
  alarm,
  onAlarm,
  onReset,
  onSimulate,
  quake,
  resetKey,
}: SeismographProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [intensity, setIntensity] = useState(80);
  const [bits, setBits] = useState(8);
  const [readout, setReadout] = useState<Readout>({
    peak: "0.00 V",
    adc: "00000000",
    comparator: "0",
    counter: "0",
  });
  const [liveActive, setLiveActive] = useState(false);

  const liveVoltageRef = useRef(liveVoltage);
  const liveTimestampRef = useRef(liveTimestamp);
  const thresholdRef = useRef(threshold);
  const alarmRef = useRef(alarm);
  const bitsRef = useRef(bits);
  const onAlarmRef = useRef(onAlarm);

  const samplesRef = useRef<Array<{ t: number; v: number; live: boolean }>>([]);
  const clockRef = useRef(0);
  const modeRef = useRef<"sim" | "live">("sim");
  const simStartRef = useRef(-1);
  const amplitudeRef = useRef(4.0);
  const peakSimRef = useRef(0);
  const peakRef = useRef(0);
  const counterRef = useRef(0);
  const alarmFiredRef = useRef(false);
  const lastReadoutRef = useRef(0);
  const lastCounterRef = useRef(0);

  useEffect(() => {
    liveVoltageRef.current = liveVoltage;
  }, [liveVoltage]);

  useEffect(() => {
    liveTimestampRef.current = liveTimestamp;
  }, [liveTimestamp]);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  useEffect(() => {
    bitsRef.current = bits;
  }, [bits]);

  useEffect(() => {
    alarmRef.current = alarm;
    if (alarm) alarmFiredRef.current = true;
  }, [alarm]);

  useEffect(() => {
    onAlarmRef.current = onAlarm;
  }, [onAlarm]);

  useEffect(() => {
    samplesRef.current = [];
    simStartRef.current = -1;
    peakRef.current = 0;
    peakSimRef.current = 0;
    counterRef.current = 0;
    alarmFiredRef.current = false;
    setReadout({ peak: "0.00 V", adc: "00000000", comparator: "0", counter: "0" });
  }, [resetKey]);

  useEffect(() => {
    if (!quake) return;

    samplesRef.current = [];
    peakRef.current = 0;
    counterRef.current = 0;
    alarmFiredRef.current = false;
    amplitudeRef.current = 0.5 + (quake.intensity / 100) * 4.2;
    peakSimRef.current = peakOfPackage(amplitudeRef.current);
    simStartRef.current = clockRef.current;
    setIntensity(quake.intensity);
  }, [quake]);

  useEffect(() => {
    let frame = 0;
    let lastLive = false;

    function signalAt(t: number): number {
      const noise =
        0.07 * Math.sin(2 * Math.PI * 0.7 * t) +
        0.05 * Math.sin(2 * Math.PI * 1.9 * t + 1.1) +
        0.03 * Math.sin(2 * Math.PI * 3.1 * t + 0.4);

      let value = noise;
      if (simStartRef.current >= 0) {
        const d = t - simStartRef.current;
        if (d >= 0 && d <= 4) {
          value +=
            amplitudeRef.current * Math.exp(-d / 1.1) * Math.sin(2 * Math.PI * 1.6 * d);
        }
      }
      return value;
    }

    function draw(t: number, live: boolean, signal: number) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;

      const ratio = window.devicePixelRatio || 1;
      if (
        canvas.width !== Math.round(width * ratio) ||
        canvas.height !== Math.round(height * ratio)
      ) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Rejilla
      ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
      ctx.lineWidth = 1;
      const stepX = Math.max(50, width / 12);
      for (let x = 0; x <= width; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += height / 6) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const y0 = live ? height - 14 : height / 2;
      const scale = live ? (height - 28) / 5 : (height / 2 - 10) / 5;

      // Línea base
      ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.lineTo(width, y0);
      ctx.stroke();

      // Umbral
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = "rgba(248, 113, 113, 0.8)";
      ctx.beginPath();
      if (live) {
        ctx.moveTo(0, y0 - thresholdRef.current * scale);
        ctx.lineTo(width, y0 - thresholdRef.current * scale);
      } else {
        ctx.moveTo(0, y0 - thresholdRef.current * scale);
        ctx.lineTo(width, y0 - thresholdRef.current * scale);
        ctx.moveTo(0, y0 + thresholdRef.current * scale);
        ctx.lineTo(width, y0 + thresholdRef.current * scale);
      }
      ctx.stroke();
      ctx.restore();

      // Etiquetas
      ctx.font = "9px Montserrat, Segoe UI, sans-serif";
      ctx.fillStyle = "#94a3b8";
      if (live) {
        ctx.fillText("5 V", 6, 12);
        ctx.fillText("0 V", 6, y0 - 4);
      } else {
        ctx.fillText("+5 V", 6, 12);
        ctx.fillText("0 V", 6, y0 - 4);
        ctx.fillText("-5 V", 6, height - 5);
      }
      ctx.fillStyle = "rgba(248, 113, 113, 0.95)";
      ctx.fillText(
        `umbral ${thresholdRef.current.toFixed(1)} V`,
        width - 84,
        y0 - thresholdRef.current * scale - 4,
      );

      // Traza
      const t0 = t - WINDOW_SECONDS;
      ctx.beginPath();
      let first = true;
      for (const sample of samplesRef.current) {
        if (sample.t < t0) continue;
        const px = ((sample.t - t0) / WINDOW_SECONDS) * width;
        const py = live ? y0 - sample.v * scale : y0 - sample.v * scale;
        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.strokeStyle = alarmRef.current ? "#f87171" : live ? "#4ade80" : "#38bdf8";
      ctx.lineWidth = 1.8;
      ctx.shadowColor = alarmRef.current
        ? "rgba(248, 113, 113, 0.75)"
        : live
          ? "rgba(74, 222, 128, 0.55)"
          : "rgba(56, 189, 248, 0.55)";
      ctx.shadowBlur = alarmRef.current ? 7 : 3;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Punto actual
      if (samplesRef.current.length) {
        const last = samplesRef.current[samplesRef.current.length - 1];
        const lx = ((last.t - t0) / WINDOW_SECONDS) * width;
        const ly = y0 - last.v * scale;
        ctx.beginPath();
        ctx.arc(lx, ly, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = alarmRef.current ? "#f87171" : live ? "#4ade80" : "#38bdf8";
        ctx.fill();
      }

      if (live) {
        ctx.fillStyle = "#4ade80";
        ctx.font = "bold 10px Montserrat, Segoe UI, sans-serif";
        ctx.fillText("SENSOR EN VIVO", width / 2 - 46, 14);
      } else if (simStartRef.current >= 0) {
        ctx.fillStyle = "#f87171";
        ctx.font = "bold 10px Montserrat, Segoe UI, sans-serif";
        ctx.fillText("SISMO EN CURSO", width / 2 - 42, 14);
      }
    }

    function loop(ms: number) {
      frame = window.requestAnimationFrame(loop);
      const t = ms / 1000;
      clockRef.current = t;

      const isLive = Boolean(
        liveTimestampRef.current && Date.now() - liveTimestampRef.current < 1500,
      );

      if (isLive !== lastLive) {
        lastLive = isLive;
        samplesRef.current = [];
        peakRef.current = 0;
        counterRef.current = 0;
        alarmFiredRef.current = alarmRef.current;
        setLiveActive(isLive);
      }

      let signal: number;
      if (isLive && liveVoltageRef.current != null) {
        signal = Math.max(0, Math.min(5, liveVoltageRef.current));
      } else {
        signal = signalAt(t);
      }

      modeRef.current = isLive ? "live" : "sim";

      if (simStartRef.current >= 0 && t - simStartRef.current > 4.5) {
        simStartRef.current = -1;
      }

      if (isLive || simStartRef.current >= 0 || alarmRef.current) {
        if (Math.abs(signal) > Math.abs(peakRef.current)) peakRef.current = signal;
      }

      if (!isLive && simStartRef.current >= 0 && t - simStartRef.current >= 0.15) {
        if (Math.abs(peakRef.current) < peakSimRef.current) {
          peakRef.current = peakSimRef.current;
        }
        if (peakSimRef.current >= thresholdRef.current && !alarmRef.current) {
          alarmFiredRef.current = true;
          onAlarmRef.current();
        }
      }

      const above = isLive ? signal >= thresholdRef.current : Math.abs(signal) >= thresholdRef.current;

      if (above && Date.now() - lastCounterRef.current > 80) {
        lastCounterRef.current = Date.now();
        counterRef.current += 1;
        if (!alarmRef.current && !alarmFiredRef.current) {
          alarmFiredRef.current = true;
          onAlarmRef.current();
        }
      }

      samplesRef.current.push({ t, v: signal, live: isLive });
      while (samplesRef.current.length && samplesRef.current[0].t < t - WINDOW_SECONDS) {
        samplesRef.current.shift();
      }

      if (Date.now() - lastReadoutRef.current > 60) {
        lastReadoutRef.current = Date.now();
        const adcValue = adcLevel(signal, bitsRef.current, isLive);
        setReadout({
          peak: `${Math.abs(peakRef.current).toFixed(2)} V`,
          adc: adcValue.toString(2).padStart(bitsRef.current, "0"),
          comparator: above ? "1" : "0",
          counter: String(counterRef.current),
        });
      }

      draw(t, isLive, signal);
    }

    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const adcValue = readout.adc;
  const leds = Array.from({ length: bits }, (_, index) => adcValue[index] === "1");

  return (
    <div className="proto-panel">
      <h3 className="flex items-center gap-2">
        <Waves size={16} className="text-sky-600" />
        Sismógrafo: la señal que dispara la alarma
        {liveActive && (
          <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-wider text-emerald-700">
            En vivo
          </span>
        )}
      </h3>

      <div className="proto-controls">
        <button
          type="button"
          onClick={() => onSimulate(intensity)}
          className="proto-btn proto-btn-primary"
        >
          <Play size={12} className="mr-1 inline" />
          Simular sismo
        </button>
        <button type="button" onClick={onReset} className="proto-btn">
          <RotateCcw size={12} className="mr-1 inline" />
          Reiniciar
        </button>

        <label>
          Intensidad
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={intensity}
            onChange={(event) => setIntensity(Number(event.target.value))}
          />
          <span className="font-mono text-xs font-bold text-indigo-600">{intensity} %</span>
        </label>

        <label>
          Umbral
          <input
            type="range"
            min={0.5}
            max={4.5}
            step={0.1}
            value={threshold}
            onChange={(event) => onThresholdChange(Number(event.target.value))}
          />
          <span className="font-mono text-xs font-bold text-indigo-600">
            {threshold.toFixed(1)} V
          </span>
        </label>

        <label>
          ADC
          <select value={bits} onChange={(event) => setBits(Number(event.target.value))}>
            <option value={8}>8 bits</option>
            <option value={4}>4 bits</option>
          </select>
        </label>
      </div>

      <canvas
        ref={canvasRef}
        className="block h-36 w-full rounded-xl border border-slate-800 bg-slate-950"
        role="img"
        aria-label="Sismograma de la señal sísmica"
      />

      <div className="mt-2 flex justify-center gap-1" aria-label="Bits de salida del ADC">
        {leds.map((on, index) => (
          <span key={index} className={`proto-led ${on ? "on" : ""}`} />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="proto-readout">
          <span className="r-label">Pico</span>
          <span className="r-value">{readout.peak}</span>
        </div>
        <div className="proto-readout">
          <span className="r-label">ADC</span>
          <span className="r-value">{readout.adc}</span>
        </div>
        <div className="proto-readout">
          <span className="r-label">Comparador</span>
          <span className="r-value">{readout.comparator}</span>
        </div>
        <div className={`proto-readout ${alarm ? "alarm" : ""}`}>
          <span className="r-label">Alarma (fijada)</span>
          <span className="r-value">{alarm ? "ACTIVADA" : "DESACTIVADA"}</span>
        </div>
        <div className="proto-readout">
          <span className="r-label">Muestras &gt; umbral</span>
          <span className="r-value">{readout.counter}</span>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        El <strong className="text-slate-700">comparador</strong> responde al instante; la{" "}
        <strong className="text-slate-700">alarma</strong> queda fijada hasta Reiniciar.
        {liveActive && " La traza verde corresponde al acelerómetro del celular."}
      </p>
    </div>
  );
}
