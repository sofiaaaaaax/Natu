import Link from "next/link";

interface AuthShellProps {
  title: string;
  promo: string[];
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthShell({ title, promo, children, footer }: AuthShellProps) {
  return (
    <section
      className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-4 py-12 sm:px-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(18, 30, 24, 0.66), rgba(18, 30, 24, 0.8)), url('/images/Sismos.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative grid w-full max-w-5xl items-center gap-10 md:grid-cols-[1fr_minmax(340px,430px)]">
        <div className="text-center text-white md:text-left">
          <span className="natu-badge border-natu-ochre/60 bg-natu-ochre/20 text-natu-ochre">
            🌿 NATU
          </span>
          <div className="mt-5 space-y-1">
            {promo.map((line) => (
              <p
                key={line}
                className="text-3xl font-light leading-tight drop-shadow sm:text-4xl"
              >
                {line}
              </p>
            ))}
          </div>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-200 md:mx-0">
            Visualiza sismos, simula escenarios y conecta tu celular con el sismógrafo
            interactivo del proyecto.
          </p>
        </div>

        <div className="w-full rounded-3xl border border-white/15 bg-white/10 p-6 shadow-natu backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-white/20 pb-4">
            <h1 className="text-lg font-extrabold uppercase tracking-wide text-white">{title}</h1>
            <span className="flex items-center gap-1.5 text-base font-extrabold text-natu-ochre">
              🌿 NATU
            </span>
          </div>

          {children}

          {footer && <div className="mt-6 text-center text-sm text-slate-200">{footer}</div>}
        </div>
      </div>

      <Link
        href="/"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-300 underline-offset-2 hover:text-white hover:underline"
      >
        ← Volver al inicio
      </Link>
    </section>
  );
}
