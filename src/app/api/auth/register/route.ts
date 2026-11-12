import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { USERNAME_PATTERN, usernameToEmail } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Crea la cuenta con el correo interno derivado del nombre de usuario y la
 * marca como confirmada usando la llave `service_role` (solo en el servidor).
 *
 * Así el registro funciona incluso si el proyecto de Supabase tiene activada
 * la opción "Confirm email", que no tiene sentido con un correo sin buzón.
 *
 * Si `SUPABASE_SERVICE_ROLE_KEY` no está configurada, responde
 * `{ configured: false }` y el cliente usa el registro normal de Supabase.
 */
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, configured: false });
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "validation", message: "Datos inválidos." },
      { status: 400 },
    );
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!USERNAME_PATTERN.test(username)) {
    return NextResponse.json(
      {
        ok: false,
        reason: "validation",
        message:
          "El nombre de usuario solo puede tener letras, números, punto, guion y guion bajo (entre 3 y 32 caracteres).",
      },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      {
        ok: false,
        reason: "validation",
        message: "La contraseña debe tener al menos 6 caracteres.",
      },
      { status: 400 },
    );
  }

  const email = usernameToEmail(username);
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("already") ||
      message.includes("registered") ||
      message.includes("exists")
    ) {
      // Si la cuenta quedó sin confirmar de un intento anterior, la confirmamos
      // para que la persona pueda entrar con la contraseña que ya eligió.
      await confirmPendingUser(admin, email);
      return NextResponse.json({ ok: false, reason: "exists" }, { status: 409 });
    }

    return NextResponse.json(
      { ok: false, reason: "error", message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

async function confirmPendingUser(admin: SupabaseClient, email: string) {
  try {
    for (let page = 1; page <= 5; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) return;

      const found = data.users.find(
        (user) => user.email?.toLowerCase() === email,
      );

      if (found) {
        if (!found.email_confirmed_at) {
          await admin.auth.admin.updateUserById(found.id, { email_confirm: true });
        }
        return;
      }

      if (data.users.length < 200) return;
    }
  } catch {
    // Si no se puede confirmar, el cliente mostrará el aviso correspondiente.
  }
}
