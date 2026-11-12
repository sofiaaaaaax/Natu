"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  Loader2,
  MapPin,
  Newspaper,
  RefreshCw,
  Waves,
} from "lucide-react";
import type { NewsItem, UsgsFeature } from "@/lib/types";
import {
  formatDateTime,
  magnitudeColor,
  relativeTime,
} from "@/lib/seismic";

const USGS_ENDPOINT = "https://earthquake.usgs.gov/fdsnws/event/1/query";
const NEWS_RSS =
  "https://news.google.com/rss/search?q=" +
  encodeURIComponent("(sismos OR temblor) Colombia when:14d") +
  "&hl=es-CO&gl=CO&ceid=CO:es";
const NEWS_API =
  "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(NEWS_RSS);

function normalizarLugar(place: string): string {
  return place
    .replace(/^\d+\s*km\s*[A-Z]+\s*of\s*/i, "")
    .trim()
    .toLowerCase();
}

function separarTituloYFuente(title: string) {
  const index = title.lastIndexOf(" - ");
  if (index === -1) return { titulo: title, fuente: "Google Noticias" };
  return { titulo: title.slice(0, index).trim(), fuente: title.slice(index + 3).trim() };
}

function parseNewsDate(pubDate: string): number {
  return new Date(String(pubDate).replace(" ", "T") + "Z").getTime();
}

export default function NoticiasPage() {
  const [earthquakes, setEarthquakes] = useState<UsgsFeature[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [earthquakesError, setEarthquakesError] = useState(false);
  const [newsError, setNewsError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [newQuakeNotice, setNewQuakeNotice] = useState(false);
  const [, setTick] = useState(0);

  const loadingRef = useRef(false);
  const latestQuakeRef = useRef(0);

  const loadEarthquakes = useCallback(async () => {
    const start = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const params = new URLSearchParams({
      format: "geojson",
      starttime: start,
      minmagnitude: "3",
      minlatitude: "-4.5",
      maxlatitude: "13.5",
      minlongitude: "-82",
      maxlongitude: "-66",
      orderby: "time",
      limit: "500",
    });

    const response = await fetch(`${USGS_ENDPOINT}?${params.toString()}`);
    if (!response.ok) throw new Error(`USGS respondió ${response.status}`);

    const data = (await response.json()) as { features?: UsgsFeature[] };
    const features = (data.features ?? [])
      .filter((item) => {
        const place = String(item.properties?.place ?? "").toLowerCase();
        const mag = item.properties?.mag;
        return place.includes("colombia") && mag != null && Number.isFinite(Number(mag));
      })
      .sort((a, b) => Number(b.properties.mag) - Number(a.properties.mag));

    const seen = new Set<string>();
    const relevant: UsgsFeature[] = [];

    for (const item of features) {
      const key = normalizarLugar(item.properties.place ?? "");
      if (seen.has(key)) continue;
      seen.add(key);
      relevant.push(item);
      if (relevant.length >= 9) break;
    }

    const newest = features.reduce(
      (max, item) => Math.max(max, Number(item.properties?.time) || 0),
      0,
    );

    if (latestQuakeRef.current && newest > latestQuakeRef.current) {
      setNewQuakeNotice(true);
      window.setTimeout(() => setNewQuakeNotice(false), 12000);
    }
    latestQuakeRef.current = Math.max(latestQuakeRef.current, newest);

    return relevant;
  }, []);

  const loadNews = useCallback(async () => {
    const response = await fetch(NEWS_API);
    if (!response.ok) throw new Error(`Servicio de noticias respondió ${response.status}`);

    const data = (await response.json()) as {
      status?: string;
      items?: Array<{ title: string; link: string; pubDate: string }>;
    };

    if (data.status !== "ok" || !Array.isArray(data.items)) {
      throw new Error("El servicio de noticias no devolvió datos válidos");
    }

    return data.items
      .slice()
      .sort((a, b) => parseNewsDate(b.pubDate) - parseNewsDate(a.pubDate))
      .slice(0, 9)
      .map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
      }));
  }, []);

  const loadAll = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const [quakeResult, newsResult] = await Promise.allSettled([
      loadEarthquakes(),
      loadNews(),
    ]);

    if (quakeResult.status === "fulfilled") {
      setEarthquakes(quakeResult.value);
      setEarthquakesError(false);
    } else {
      console.error("Error al cargar los sismos del USGS:", quakeResult.reason);
      setEarthquakesError(true);
    }

    if (newsResult.status === "fulfilled") {
      setNews(newsResult.value);
      setNewsError(false);
    } else {
      console.error("Error al cargar las noticias:", newsResult.reason);
      setNewsError(true);
    }

    const hora = new Intl.DateTimeFormat("es-CO", {
      timeStyle: "short",
      timeZone: "America/Bogota",
    }).format(new Date());

    setLastUpdate(hora);
    setLoading(false);
    loadingRef.current = false;
  }, [loadEarthquakes, loadNews]);

  useEffect(() => {
    loadAll();
    const interval = window.setInterval(loadAll, 5 * 60 * 1000);
    const clock = window.setInterval(() => setTick((value) => value + 1), 60 * 1000);

    function onVisibilityChange() {
      if (!document.hidden) loadAll();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(clock);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadAll]);

  return (
    <div className="bg-[#eef2f7]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.22),transparent_45%),linear-gradient(135deg,#0f172a_0%,#1e3a5f_100%)] p-6 text-white shadow-natu sm:p-10">
          <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-emerald-300">
            🌎 Monitoreo en tiempo real
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
            Noticias sísmicas de Colombia
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Los sismos más relevantes reportados por el USGS y las noticias más recientes
            de medios colombianos, reunidos automáticamente en un solo lugar. La página se
            actualiza sola cuando aparece un sismo nuevo; si no, cada 5 minutos revisa
            novedades.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              {loading
                ? "Consultando fuentes en tiempo real…"
                : lastUpdate
                  ? `Última actualización: hoy a las ${lastUpdate} (hora Colombia).`
                  : "Sin actualización todavía."}
            </span>
            <button
              type="button"
              onClick={loadAll}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-extrabold text-emerald-950 transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {loading ? "Actualizando…" : "Actualizar ahora"}
            </button>
          </div>

          {newQuakeNotice && (
            <div className="mt-4 rounded-xl border border-emerald-400/60 border-l-4 border-l-emerald-500 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100">
              🆕 Se detectó un sismo más reciente. La información se actualizó
              automáticamente.
            </div>
          )}
        </section>

        <section className="mt-10" aria-labelledby="sismos-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="sismos-title" className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                <Waves size={20} className="text-rose-600" />
                Sismos recientes en Colombia
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Sismos de magnitud 3 o superior reportados en los últimos 60 días.
              </p>
            </div>
            <a
              href="https://earthquake.usgs.gov/earthquakes/map/?extent=-4.5,-82,13.5,-66"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:underline"
            >
              Ver mapa del USGS
              <ExternalLink size={13} />
            </a>
          </div>

          {earthquakesError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              No se pudieron cargar los sismos en este momento.{" "}
              <a
                href="https://earthquake.usgs.gov/earthquakes/map/?extent=-4.5,-82,13.5,-66"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline"
              >
                Consultar directamente en USGS ↗
              </a>
            </div>
          ) : loading && !earthquakes.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-44 animate-natu-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : earthquakes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              No hay sismos de magnitud 3 o superior reportados para Colombia en los
              últimos 60 días.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {earthquakes.map((item) => {
                const mag = Number(item.properties.mag);
                const depth = item.geometry?.coordinates?.[2];
                const color = magnitudeColor(mag);
                const status =
                  item.properties.status === "reviewed" ? "Revisado" : "Automático";

                return (
                  <article
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-natu-soft transition hover:-translate-y-1 hover:shadow-lg"
                    style={{ borderTopColor: color, borderTopWidth: 5 }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="grid h-14 w-14 flex-none place-items-center rounded-full text-xl font-extrabold text-white shadow-inner"
                        style={{ backgroundColor: color }}
                      >
                        {mag.toFixed(1)}
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-start gap-1 text-sm font-bold leading-5 text-slate-900">
                          <MapPin size={14} className="mt-0.5 flex-none text-slate-400" />
                          {item.properties.place || "Lugar no disponible"}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {formatDateTime(item.properties.time)} ·{" "}
                          {relativeTime(item.properties.time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.7rem] font-semibold text-slate-600">
                        Profundidad:{" "}
                        {Number.isFinite(depth) ? Math.round(depth) : "?"} km
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.7rem] font-semibold text-slate-600">
                        {status}
                      </span>
                    </div>

                    <a
                      href={item.properties.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                    >
                      Ver detalle en USGS
                      <ExternalLink size={12} />
                    </a>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-12" aria-labelledby="noticias-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="noticias-title" className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                <Newspaper size={20} className="text-emerald-700" />
                Últimas noticias
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Titulares recientes sobre sismos y temblores en Colombia.
              </p>
            </div>
            <a
              href="https://news.google.com/search?q=temblor%20Colombia&hl=es-CO&gl=CO&ceid=CO:es"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:underline"
            >
              Ver más en Google Noticias
              <ExternalLink size={13} />
            </a>
          </div>

          {newsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              No se pudieron cargar las noticias en este momento.{" "}
              <a
                href="https://news.google.com/search?q=temblor%20Colombia&hl=es-CO&gl=CO&ceid=CO:es"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline"
              >
                Verlas en Google Noticias ↗
              </a>
            </div>
          ) : loading && !news.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-40 animate-natu-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              No hay noticias recientes disponibles.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => {
                const { titulo, fuente } = separarTituloYFuente(item.title);
                const timestamp = parseNewsDate(item.pubDate);
                const dateText = Number.isFinite(timestamp)
                  ? `${formatDateTime(timestamp)} · ${relativeTime(timestamp)}`
                  : "Fecha no disponible";

                return (
                  <article
                    key={`${item.link}-${item.title}`}
                    className="flex flex-col rounded-2xl border border-slate-200 border-l-4 border-l-emerald-600 bg-white p-5 shadow-natu-soft transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-wider text-emerald-700">
                      {fuente}
                    </p>
                    <h3 className="mt-2 flex-1 text-base font-bold leading-6 text-slate-900">
                      {titulo}
                    </h3>
                    <p className="mt-3 text-xs text-slate-500">{dateText}</p>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                    >
                      Leer noticia completa
                      <ExternalLink size={12} />
                    </a>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-natu-soft sm:p-8">
          <h2 className="text-lg font-extrabold text-slate-900">Fuentes en tiempo real</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            La información de esta página se obtiene de servicios públicos y se actualiza
            automáticamente.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { href: "https://earthquake.usgs.gov/earthquakes/map/", label: "🇺🇸 USGS" },
              { href: "https://www.sgc.gov.co/sismos", label: "🇨🇴 SGC" },
              {
                href: "https://news.google.com/search?q=temblor%20Colombia&hl=es-CO&gl=CO&ceid=CO:es",
                label: "📰 Google Noticias",
              },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
              >
                {label}
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-400">
            NATU es un proyecto académico. La información puede tardar en actualizarse y no
            sustituye los reportes oficiales del Servicio Geológico Colombiano.
          </p>
        </section>
      </div>
    </div>
  );
}
