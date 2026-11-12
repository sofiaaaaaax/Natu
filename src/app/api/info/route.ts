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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;

  return NextResponse.json({
    ok: true,
    urlMovil: `${base}/sensor`,
    // El canal real es `seismic-sensor:<uuid-de-la-cuenta>`; el mapa agrega
    // ese alcance al QR para que el celular publique solo en tu cuenta.
    canal: "seismic-sensor:<tu-cuenta>",
    evento: "motion",
    supabase: Boolean(supabaseUrl && supabaseAnonKey),
    // La llave anónima es pública por diseño; Expo.html la usa para
    // escuchar el acelerómetro del celular en la Diapositiva 8.
    supabaseUrl,
    supabaseAnonKey,
  }, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      // Permite que Expo.html abierto en local use la configuración pública
      // del despliegue para enlazar el celular con la Diapositiva 8.
      "Access-Control-Allow-Origin": "*",
    },
  });
}
