"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Mail, RefreshCw } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { getSiteUrl, isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export default function RecuperarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) setRecoveryMode(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function sendEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError(
        "Supabase no está configurado. Agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      );
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${getSiteUrl()}/recuperar` },
    );
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(
      "Si el correo está registrado, recibirás un enlace para crear una nueva contraseña. Revisa también la carpeta de spam.",
    );
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!supabase) return;

    if (password.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess("✅ Contraseña actualizada correctamente. Redirigiendo al inicio de sesión…");
    await supabase.auth.signOut();

    window.setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1800);
  }

  async function useAnotherEmail() {
    if (supabase) await supabase.auth.signOut();
    setRecoveryMode(false);
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(null);
  }

  return (
    <AuthShell
      title={recoveryMode ? "Nueva contraseña" : "Recuperar contraseña"}
      promo={["Recupera", "tu cuenta", "en NATU"]}
      footer={
        <>
          ¿Ya la recordaste?{" "}
          <Link href="/login" className="font-bold text-natu-ochre hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      {!isSupabaseConfigured && (
        <div className="mb-5 rounded-xl border border-amber-300/50 bg-amber-300/15 px-4 py-3 text-xs leading-5 text-amber-100">
          <strong className="block text-amber-200">Modo demostración</strong>
          Configura Supabase para enviar correos reales de recuperación.
        </div>
      )}

      {!recoveryMode ? (
        <form onSubmit={sendEmail} className="space-y-4">
          <p className="text-sm leading-6 text-slate-200">
            Escribe el correo con el que te registraste. Te enviaremos un enlace seguro
            para crear una nueva contraseña.
          </p>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-left text-xs font-bold uppercase tracking-wider text-slate-200">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nombre@gmail.com"
              className="natu-input"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-300/60 bg-red-500/20 px-4 py-3 text-sm leading-6 text-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-300/60 bg-emerald-500/20 px-4 py-3 text-sm leading-6 text-emerald-100">
              {success}
            </div>
          )}

          <button type="submit" disabled={loading} className="natu-btn-primary w-full py-3.5">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
            {loading ? "Enviando…" : "Enviar enlace de recuperación"}
          </button>

          <button
            type="button"
            onClick={() => setRecoveryMode(true)}
            className="w-full text-center text-xs font-semibold text-slate-300 hover:text-natu-ochre hover:underline"
          >
            Ya tengo un enlace de recuperación abierto
          </button>
        </form>
      ) : (
        <form onSubmit={updatePassword} className="space-y-4">
          <p className="text-sm leading-6 text-slate-200">
            Define una nueva contraseña para tu cuenta. Debe tener al menos 6 caracteres.
          </p>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-left text-xs font-bold uppercase tracking-wider text-slate-200">
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="natu-input"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-left text-xs font-bold uppercase tracking-wider text-slate-200">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repite la nueva contraseña"
              className="natu-input"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-300/60 bg-red-500/20 px-4 py-3 text-sm leading-6 text-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-300/60 bg-emerald-500/20 px-4 py-3 text-sm leading-6 text-emerald-100">
              {success}
            </div>
          )}

          <button type="submit" disabled={loading} className="natu-btn-primary w-full py-3.5">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
            {loading ? "Guardando…" : "Cambiar contraseña"}
          </button>

          <button
            type="button"
            onClick={useAnotherEmail}
            className="flex w-full items-center justify-center gap-2 text-center text-xs font-semibold text-slate-300 hover:text-natu-ochre hover:underline"
          >
            <RefreshCw size={13} />
            Usar otro correo
          </button>
        </form>
      )}
    </AuthShell>
  );
}
