"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { USERNAME_PATTERN, usernameToEmail } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export default function RegistroPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function celebrate() {
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.65 },
      colors: ["#2c3e35", "#d4a574", "#a4a478", "#ffffff"],
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError(
        "Supabase no está configurado. Agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      );
      return;
    }

    if (username.trim().length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }

    if (!USERNAME_PATTERN.test(username.trim())) {
      setError(
        "El nombre de usuario solo puede tener letras, números, punto, guion y guion bajo (sin espacios ni acentos).",
      );
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const internalEmail = usernameToEmail(username);
    const { data, error: authError } = await supabase.auth.signUp({
      email: internalEmail,
      password,
      options: {
        data: { username: username.trim() },
      },
    });

    if (authError) {
      const message = authError.message.toLowerCase();

      // Si el usuario ya existía (por ejemplo, de un intento anterior),
      // probamos iniciar sesión con la misma contraseña.
      if (message.includes("already")) {
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: internalEmail,
          password,
        });
        setLoading(false);

        if (!retryError) {
          await celebrate();
          setSuccess("Sesión iniciada. Redirigiendo al mapa…");
          router.push("/mapa");
          router.refresh();
          return;
        }

        setError("Ese nombre de usuario ya está registrado. Inicia sesión o elige otro.");
        return;
      }

      if (
        message.includes("rate limit") ||
        message.includes("confirmation") ||
        message.includes("smtp")
      ) {
        setLoading(false);
        setError(
          "Supabase intentó enviar un correo de confirmación. Desactiva “Confirm email” en Supabase → Authentication → Sign In / Providers → Email y vuelve a intentarlo.",
        );
        return;
      }

      setLoading(false);
      setError(authError.message);
      return;
    }

    if (data.session) {
      setLoading(false);
      await celebrate();
      setSuccess("¡Cuenta creada! Redirigiendo al mapa…");
      router.push("/mapa");
      router.refresh();
      return;
    }

    // Supabase no devolvió sesión. Puede ser que el nombre ya exista o que
    // el proyecto tenga activada la confirmación por correo.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password,
    });
    setLoading(false);

    if (!signInError) {
      await celebrate();
      setSuccess("¡Cuenta creada! Redirigiendo al mapa…");
      router.push("/mapa");
      router.refresh();
      return;
    }

    if (signInError.message.toLowerCase().includes("email not confirmed")) {
      setError(
        "La cuenta se creó, pero Supabase está pidiendo confirmar un correo. Como el registro ahora es con nombre de usuario, desactiva “Confirm email” en Supabase → Authentication → Sign In / Providers → Email. Si ya lo desactivaste y sigue apareciendo, elimina ese usuario en Authentication → Users y regístrate de nuevo.",
      );
      return;
    }

    if ((data.user?.identities?.length ?? 0) === 0) {
      setError("Ese nombre de usuario ya está registrado. Inicia sesión o elige otro.");
      return;
    }

    setError(
      "No se pudo iniciar la sesión automáticamente. Ve a “Iniciar sesión” e intenta con tu nombre de usuario y contraseña.",
    );
  }

  return (
    <AuthShell
      title="Únete a nosotros"
      promo={["Únete a nosotros", "para descubrir", "nuestra página"]}
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-bold text-natu-ochre hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      {!isSupabaseConfigured && (
        <div className="mb-5 rounded-xl border border-amber-300/50 bg-amber-300/15 px-4 py-3 text-xs leading-5 text-amber-100">
          <strong className="block text-amber-200">Modo demostración</strong>
          Configura las variables de Supabase para habilitar el registro real.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1.5 block text-left text-xs font-bold uppercase tracking-wider text-slate-200">
            Nombre de usuario
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Ej. juan_natu"
            className="natu-input"
          />
          <p className="mt-1.5 text-[0.7rem] leading-5 text-slate-300">
            Sin espacios ni acentos. Es el nombre con el que iniciarás sesión.
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
              autoComplete="new-password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
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

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-left text-xs font-bold uppercase tracking-wider text-slate-200">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={6}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repite tu contraseña"
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
          {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          {loading ? "Creando cuenta…" : "Continuar"}
        </button>

        <p className="text-center text-[0.72rem] leading-5 text-slate-300">
          Si continúas, aceptas los{" "}
          <Link href="/terminos" className="font-bold text-natu-ochre hover:underline">
            términos y condiciones
          </Link>{" "}
          de nuestra página.
        </p>
      </form>
    </AuthShell>
  );
}
