import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ExternalLink,
  MapPinned,
  Newspaper,
  Radio,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    href: "/mapa",
    icon: MapPinned,
    title: "Mapa interactivo",
    description:
      "Marca un epicentro, ajusta magnitud y profundidad, y observa el área de afectación con ondas sísmicas animadas.",
    accent: "bg-rose-50 text-rose-600",
  },
  {
    href: "/sensor",
    icon: Radio,
    title: "Sensor móvil",
    description:
      "Convierte el acelerómetro de tu celular en un sismógrafo 0–5 V y transmite la señal al mapa en tiempo real.",
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    href: "/noticias",
    icon: Newspaper,
    title: "Noticias en vivo",
    description:
      "Sismos reportados por el USGS para Colombia y titulares recientes reunidos automáticamente.",
    accent: "bg-sky-50 text-sky-700",
  },
  {
    href: "/informacion",
    icon: BookOpen,
    title: "Guía educativa",
    description:
      "13 secciones para entender cómo se originan los sismos, qué significan magnitud e intensidad y cómo prepararte.",
    accent: "bg-orange-50 text-orange-700",
  },
];

export default function HomePage() {
  return (
    <>
      <section
        className="relative flex min-h-[calc(100vh-64px)] flex-col justify-between overflow-hidden text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(18, 30, 24, 0.62), rgba(18, 30, 24, 0.78)), url('/images/Sismos.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,165,116,0.18),transparent_45%)]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
          <span className="natu-badge animate-fade-in-down border-natu-ochre/60 bg-natu-ochre/20 text-natu-ochre">
            🌎 Proyecto académico · Colombia
          </span>

          <h1 className="mt-6 animate-fade-in-down text-3xl font-light tracking-wide sm:text-5xl">
            Bienvenido a
          </h1>
          <h2 className="animate-fade-in-up text-6xl font-extrabold tracking-[0.18em] text-natu-sage drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] sm:text-8xl">
            NATU
          </h2>

          <p className="mt-6 max-w-2xl animate-fade-in-up text-base font-medium leading-8 text-slate-100 drop-shadow sm:text-lg">
            Información en tiempo real sobre fenómenos naturales. Visualiza sismos,
            simula escenarios y conecta el acelerómetro de tu celular con un sismógrafo
            interactivo.
          </p>

          <div className="mt-9 flex animate-fade-in-up flex-wrap items-center justify-center gap-4">
            <Link href="/registro" className="natu-btn-primary px-8 py-4 text-base">
              Registrarse
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="natu-btn-outline px-8 py-4 text-base">
              Iniciar sesión
            </Link>
            <Link href="/mapa" className="natu-btn-green px-8 py-4 text-base">
              <Activity size={18} />
              Abrir simulador
            </Link>
            <a
              href="/Exposicion/Expo11-18-2025/Expo.html"
              target="_blank"
              rel="noopener noreferrer"
              className="natu-btn-outline px-8 py-4 text-base"
            >
              <ExternalLink size={18} />
              Abrir Expo.html
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-200">
            <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 backdrop-blur">
              ⚡ Supabase Realtime
            </span>
            <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 backdrop-blur">
              🗺️ OpenStreetMap
            </span>
            <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 backdrop-blur">
              📡 USGS + SGC
            </span>
            <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 backdrop-blur">
              🛡️ Supabase Auth
            </span>
          </div>
        </div>

        <nav className="relative mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 pb-8 text-sm font-semibold sm:px-6">
          <div className="flex flex-wrap gap-6">
            <Link href="/informacion" className="transition hover:text-natu-ochre">
              Información
            </Link>
            <Link href="/noticias" className="transition hover:text-natu-ochre">
              Noticias
            </Link>
            <Link href="/mapa" className="transition hover:text-natu-ochre">
              Mapa
            </Link>
            <Link href="/terminos" className="transition hover:text-natu-ochre">
              Términos
            </Link>
          </div>
          <a
            href="/Exposicion/Expo11-18-2025/Expo.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-natu-ochre transition hover:text-white"
          >
            Ver diapositivas
            <ExternalLink size={14} />
          </a>
        </nav>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <span className="natu-badge">Explora la plataforma</span>
          <h2 className="mt-4 text-3xl font-extrabold text-natu-green sm:text-4xl">
            Una herramienta para aprender y experimentar
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            NATU reúne visualización geográfica, simulación sísmica, datos abiertos y
            hardware interactivo en una sola experiencia web.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ href, icon: Icon, title, description, accent }) => (
            <Link
              key={href}
              href={href}
              className="group natu-card flex flex-col transition hover:-translate-y-1 hover:border-natu-sage/60 hover:shadow-lg"
            >
              <span className={`mb-4 inline-grid h-12 w-12 place-items-center rounded-xl ${accent}`}>
                <Icon size={22} />
              </span>
              <h3 className="text-lg font-extrabold text-natu-green">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-natu-green group-hover:text-orange-700">
                Explorar
                <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              value: "100%",
              label: "Compatible con Vercel",
              text: "Sin servidores WebSocket persistentes: autenticación y tiempo real sobre Supabase.",
            },
            {
              icon: Activity,
              value: "< 50 ms",
              label: "Latencia de transmisión",
              text: "El acelerómetro del celular se publica por Broadcast Channels y el mapa reacciona al instante.",
            },
            {
              icon: BookOpen,
              value: "13",
              label: "Secciones educativas",
              text: "Contenido sobre origen, ondas, magnitud, intensidad, prevención y contexto colombiano.",
            },
          ].map(({ icon: Icon, value, label, text }) => (
            <div key={label} className="flex gap-4">
              <span className="inline-grid h-12 w-12 flex-none place-items-center rounded-xl bg-natu-green/10 text-natu-green">
                <Icon size={22} />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-natu-green">{value}</p>
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-natu-dark via-natu-green to-[#405c4c] px-6 py-12 text-white shadow-natu sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-natu-ochre/20 blur-2xl" />
          <div className="relative max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-natu-ochre">
              Presentación del proyecto
            </span>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Las diapositivas originales siguen disponibles
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-200 sm:text-base">
              La exposición académica completa, incluida la diapositiva interactiva del
              sismógrafo, se conserva intacta dentro de la aplicación.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/Exposicion/Expo11-18-2025/Expo.html"
                target="_blank"
                rel="noopener noreferrer"
                className="natu-btn-primary"
              >
                Abrir exposición
                <ExternalLink size={16} />
              </a>
              <Link href="/mapa" className="natu-btn-outline">
                Ir al simulador
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
