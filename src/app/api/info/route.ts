import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Compatibilidad con la Diapositiva 8 de Expo.html.
 * La exposición pide /api/info para construir el QR que abre el sensor móvil.
 */
export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const base = configured || origin;

  return NextResponse.json({
    ok: true,
    urlMovil: `${base}/sensor`,
    canal: "seismic-sensor",
    evento: "motion",
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  });
}
