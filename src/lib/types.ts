export interface MotionPayload {
  /** Voltaje 0-5 V calculado a partir del acelerómetro. */
  v: number;
  /** Timestamp en milisegundos. */
  t: number;
}

export interface UsgsFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string;
    status?: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source?: string;
}

export interface Epicenter {
  lat: number;
  lng: number;
}

export interface QuakeConfig {
  magnitude: number;
  depth: number;
  duration: number;
}

export type SensorStatus = "idle" | "no-account" | "connecting" | "connected" | "error";
