"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { loginIdentifierToEmail } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/mapa");
    });
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!supabase) {
      setError(
        "Supabase no está configurado. Agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      );
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginIdentifierToEmail(identifier),
      password,
    });
    setLoading(false);

    if (authError) {
      const message = authError.message.toLowerCase();
      setError(
        message.includes("invalid login credentials")
          ? "Usuario o contraseña incorrectos. Verifica tus datos e intenta de nuevo."
          : message.includes("email not confirmed")
            ? "Supabase está exigiendo confirmar un correo para esta cuenta. Desactiva “Confirm email” en Supabase → Authentication → Sign In / Providers → Email."
            : authError.message,
      );
      return;
    }

    setNotice("Sesión iniciada. Redirigiendo al mapa…");
    router.push("/mapa");
    router.refresh();
  }

  return (
    <AuthShell
      title="Iniciar sesión"
      promo={["Inicia sesión", "para descubrir", "este gran mundo"]}
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="font-bold text-natu-ochre hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      {!isSupabaseConfigured && (
        <div className="mb-5 rounded-xl border border-amber-300/50 bg-amber-300/15 px-4 py-3 text-xs leading-5 text-amber-100">
          <strong className="block text-amber-200">Modo demostración</strong>
          Configura las variables de Supabase para habilitar el registro y el inicio de
          sesión reales. Mientras tanto puedes explorar el mapa y el sensor.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="identifier" className="mb-1.5 block text-left text-xs font-bold uppercase tracking-wider text-slate-200">
            Nombre de usuario
          </label>
          <input
            id="identifier"
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Tu nombre de usuario"
            className="natu-input"
          />
          <p className="mt-1.5 text-[0.7rem] leading-5 text-slate-300">
            También puedes entrar con tu correo si tu cuenta es antigua.
          </p>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-left text-xs font-bold uppercase tracking-wider text-slate-200">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña"
              className="natu-input pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-natu-green"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <Link href="/recuperar" className="text-xs font-semibold text-slate-200 hover:text-natu-ochre hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-300/60 bg-red-500/20 px-4 py-3 text-sm leading-6 text-red-100">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-xl border border-emerald-300/60 bg-emerald-500/20 px-4 py-3 text-sm leading-6 text-emerald-100">
            {notice}
          </div>
        )}

        <button type="submit" disabled={loading} className="natu-btn-primary w-full py-3.5">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          {loading ? "Ingresando…" : "Continuar"}
        </button>

        <Link href="/mapa" className="natu-btn-outline w-full py-3 text-sm">
          Explorar sin cuenta
        </Link>
      </form>
    </AuthShell>
  );
}
