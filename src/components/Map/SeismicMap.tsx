"use client";

import dynamic from "next/dynamic";
import type { Epicenter } from "@/lib/types";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-natu-green" />
        Cargando mapa interactivo…
      </div>
    </div>
  ),
});

interface SeismicMapProps {
  epicenter: Epicenter | null;
  onEpicenter: (epicenter: Epicenter) => void;
  onCoords: (coords: Epicenter | null) => void;
  magnitude: number;
  depth: number;
  waveTick: number;
  waveClear: number;
  shaking: boolean;
}

export default function SeismicMap(props: SeismicMapProps) {
  return <LeafletMap {...props} />;
}
