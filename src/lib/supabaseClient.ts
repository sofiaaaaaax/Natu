import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * true solo cuando hay credenciales reales de Supabase.
 * Si falta configuración, la app sigue funcionando en modo demostración
 * (el sensor usa simulación táctil y el mapa conserva el simulador local).
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("TU-PROYECTO") &&
    !supabaseAnonKey.includes("TU_ANON_KEY"),
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Canal público de Supabase Realtime usado por el celular y el mapa. */
export const SENSOR_CHANNEL = "seismic-sensor";
export const SENSOR_EVENT = "motion";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}
