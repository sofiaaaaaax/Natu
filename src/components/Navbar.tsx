"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  BookOpen,
  ExternalLink,
  Leaf,
  LogIn,
  LogOut,
  Map,
  Menu,
  Newspaper,
  Radio,
  X,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

const links = [
  { href: "/", label: "Inicio", icon: Leaf },
  { href: "/mapa", label: "Mapa", icon: Map },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/informacion", label: "Información", icon: BookOpen },
  { href: "/sensor", label: "Sensor", icon: Radio },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }

  const displayName =
    (user?.user_metadata?.username as string | undefined) ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <header className="sticky top-0 z-[1200] border-b border-white/10 bg-natu-dark/95 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2" aria-label="NATU inicio">
          <span className="text-2xl transition group-hover:rotate-12">🌿</span>
          <span className="text-xl font-extrabold tracking-[0.2em] text-natu-sage">NATU</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-natu-ochre text-natu-dark"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}

          <a
            href="/Exposicion/Expo11-18-2025/Expo.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Diapositivas
            <ExternalLink size={13} />
          </a>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {!isSupabaseConfigured ? (
            <span
              className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-amber-200"
              title="Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY"
            >
              Modo demo
            </span>
          ) : ready && user ? (
            <>
              <span className="max-w-[150px] truncate rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200">
                {displayName}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-full border border-red-400/50 bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-100 transition hover:bg-red-500"
              >
                <LogOut size={14} />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white hover:text-natu-green"
              >
                <LogIn size={14} />
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-full bg-natu-ochre px-4 py-2 text-xs font-extrabold text-natu-dark transition hover:bg-[#e0b487]"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg border border-white/20 p-2 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Abrir menú"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-natu-dark px-4 pb-4 lg:hidden">
          <nav className="grid gap-1 pt-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  pathname === href ? "bg-natu-ochre text-natu-dark" : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <a
              href="/Exposicion/Expo11-18-2025/Expo.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
            >
              <ExternalLink size={16} />
              Diapositivas
            </a>
          </nav>

          <div className="mt-3 grid gap-2 border-t border-white/10 pt-3">
            {ready && user ? (
              <>
                <span className="truncate text-xs text-slate-300">{user.email}</span>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex items-center justify-center gap-2 rounded-full bg-red-500/20 px-4 py-2 text-sm font-bold text-red-100"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-white/30 px-4 py-2 text-center text-sm font-bold"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="rounded-full bg-natu-ochre px-4 py-2 text-center text-sm font-extrabold text-natu-dark"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
