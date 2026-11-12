import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-natu-dark text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-lg font-extrabold tracking-[0.2em] text-natu-sage">NATU</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
            Sistema académico de visualización sísmica y alerta temprana para Colombia.
            Información educativa, no sustituye los reportes oficiales.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-natu-ochre">
            Explorar
          </h2>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>
              <Link href="/mapa" className="hover:text-white">
                Mapa y simulador
              </Link>
            </li>
            <li>
              <Link href="/noticias" className="hover:text-white">
                Noticias sísmicas
              </Link>
            </li>
            <li>
              <Link href="/informacion" className="hover:text-white">
                Guía educativa
              </Link>
            </li>
            <li>
              <Link href="/sensor" className="hover:text-white">
                Sensor móvil
              </Link>
            </li>
            <li>
              <a
                href="/Exposicion/Expo11-18-2025/Expo.html"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                Diapositivas del proyecto ↗
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-natu-ochre">
            Fuentes oficiales
          </h2>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>
              <a
                href="https://www.sgc.gov.co/sismos"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                Servicio Geológico Colombiano ↗
              </a>
            </li>
            <li>
              <a
                href="https://earthquake.usgs.gov/earthquakes/map/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                USGS Earthquakes ↗
              </a>
            </li>
            <li>
              <a
                href="https://www.gestiondelriesgo.gov.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                UNGRD ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Proyecto NATU · Next.js + Supabase + Vercel ·{" "}
        <Link href="/terminos" className="hover:text-slate-300">
          Términos y condiciones
        </Link>
      </div>
    </footer>
  );
}
