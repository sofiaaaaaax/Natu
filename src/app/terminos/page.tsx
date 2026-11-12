import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Términos y condiciones",
};

export default function TerminosPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <span className="inline-grid h-12 w-12 place-items-center rounded-xl bg-natu-green/10 text-natu-green">
          <ShieldCheck size={24} />
        </span>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-natu-ochre">
            NATU
          </p>
          <h1 className="text-3xl font-extrabold text-natu-green">Términos y condiciones</h1>
        </div>
      </div>

      <div className="natu-card space-y-5 text-sm leading-7 text-slate-700">
        <p>
          NATU es un proyecto académico de visualización sísmica y simulación. La
          información mostrada es demostrativa y educativa, y <strong>no sustituye</strong>{" "}
          los sistemas oficiales de alerta ni los reportes del Servicio Geológico
          Colombiano (SGC) o de la Unidad Nacional para la Gestión del Riesgo de Desastres
          (UNGRD).
        </p>

        <div>
          <h2 className="mb-2 text-base font-extrabold text-slate-900">1. Cuentas y datos</h2>
          <p>
            El registro y el inicio de sesión se gestionan mediante{" "}
            <strong>Supabase Auth</strong>. Las contraseñas se almacenan cifradas por el
            proveedor de autenticación y no son accesibles para el equipo del proyecto. Los
            datos asociados a tu cuenta son el correo electrónico, el nombre de usuario y la
            información básica de sesión.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-base font-extrabold text-slate-900">2. Correos electrónicos</h2>
          <p>
            El correo se utiliza para confirmar la cuenta, enviar enlaces de recuperación de
            contraseña y, si está configurado, notificaciones de seguridad. No compartimos tu
            correo con terceros ajenos a la operación técnica de la plataforma.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-base font-extrabold text-slate-900">3. Uso del sensor móvil</h2>
          <p>
            La ruta <strong>/sensor</strong> solicita permiso para acceder al acelerómetro del
            dispositivo. Los valores de movimiento se convierten a un voltaje de 0 a 5 V y se
            transmiten por un canal público de Supabase Realtime para alimentar el sismógrafo
            del mapa. No se graba audio, video ni ubicación desde esa función.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-base font-extrabold text-slate-900">4. Datos de terceros</h2>
          <p>
            La página de noticias consulta la API pública del USGS y titulares de Google
            Noticias mediante un servicio RSS. Esa información puede tardar en actualizarse y
            debe verificarse siempre en las fuentes oficiales.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-base font-extrabold text-slate-900">5. Responsabilidad</h2>
          <p>
            El proyecto se ofrece con fines educativos. No garantizamos la disponibilidad
            continua del servicio ni la exactitud de las simulaciones. En caso de emergencia,
            sigue las indicaciones de las autoridades y llama a la línea única{" "}
            <strong>123</strong> en Colombia.
          </p>
        </div>

        <p className="rounded-xl border-l-4 border-natu-ochre bg-natu-ochre/10 px-4 py-3 text-sm">
          Al continuar con el registro aceptas estas condiciones y el tratamiento descrito
          de tus datos.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/registro" className="natu-btn-green">
          Volver al registro
        </Link>
        <Link href="/" className="natu-btn-ghost">
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}
