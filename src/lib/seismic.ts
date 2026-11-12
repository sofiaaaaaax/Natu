/**
 * Utilidades compartidas del simulador sísmico.
 * Las fórmulas replican las del proyecto original (Mapalnit.js).
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function affectedRadiusKm(magnitude: number, depth: number): number {
  const baseKm = Math.pow(10, 0.4 * magnitude - 0.3);
  const depthFactor = Math.pow(15 / (15 + Math.max(0, depth)), 0.3);
  return clamp(baseKm * depthFactor, 1, 1200);
}

export function classifyDepth(depth: number): string {
  if (depth < 70) return "Superficial";
  if (depth < 300) return "Intermedio";
  return "Profundo";
}

export function classifyMagnitude(magnitude: number): string {
  if (magnitude < 3) return "Leve";
  if (magnitude < 4) return "Menor";
  if (magnitude < 5) return "Moderado";
  if (magnitude < 6) return "Fuerte";
  if (magnitude < 7) return "Muy fuerte";
  return "Severo";
}

export function seismicStyle(magnitude: number) {
  if (magnitude < 3) {
    return { fillColor: "#fbbf24", strokeColor: "#d97706", fillOpacity: 0.28 };
  }
  if (magnitude < 4) {
    return { fillColor: "#f59e0b", strokeColor: "#d97706", fillOpacity: 0.32 };
  }
  if (magnitude < 5) {
    return { fillColor: "#fb923c", strokeColor: "#ea580c", fillOpacity: 0.36 };
  }
  if (magnitude < 6) {
    return { fillColor: "#f87171", strokeColor: "#dc2626", fillOpacity: 0.4 };
  }
  if (magnitude < 7) {
    return { fillColor: "#ef4444", strokeColor: "#b91c1c", fillOpacity: 0.44 };
  }
  return { fillColor: "#dc2626", strokeColor: "#7f1d1d", fillOpacity: 0.5 };
}

/** Energía aproximada: log10(E) = 1.5·M + 4.8 (julios). */
export function formatEnergy(magnitude: number): string {
  const joules = Math.pow(10, 1.5 * magnitude + 4.8);
  const tonsTnt = joules / 4.184e9;

  if (tonsTnt >= 1e6) return `${(tonsTnt / 1e6).toFixed(1)} Mt de TNT`;
  if (tonsTnt >= 1e3) return `${(tonsTnt / 1e3).toFixed(1)} kt de TNT`;
  if (tonsTnt >= 1) return `${tonsTnt.toFixed(0)} t de TNT`;
  return `${(tonsTnt * 1000).toFixed(0)} kg de TNT`;
}

export function formatDateTime(ms: number): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(ms));
}

export function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} día${days === 1 ? "" : "s"}`;

  return formatDateTime(ms);
}

export function magnitudeColor(magnitude: number): string {
  if (magnitude >= 6) return "#991b1b";
  if (magnitude >= 5) return "#dc2626";
  if (magnitude >= 4) return "#ea580c";
  return "#d97706";
}
