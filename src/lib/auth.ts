/**
 * Supabase Auth trabaja con correo o teléfono, no con nombres de usuario.
 * Para que el registro pida solo un nombre de usuario, creamos un correo
 * interno determinista a partir de él (ej. `juan_natu@natu.app`). El usuario
 * nunca ve ese correo: es solo la llave que usa Supabase por debajo.
 *
 * Importante: en el panel de Supabase debe estar desactivada la opción
 * "Confirm email" (Authentication → Providers → Email), porque el correo
 * interno no tiene buzón real.
 */
export const USERNAME_EMAIL_DOMAIN = "natu.app";

/** Letras, números, punto, guion y guion bajo. Entre 3 y 32 caracteres. */
export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/;

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/** Convierte un nombre de usuario en el correo interno de Supabase. */
export function usernameToEmail(username: string): string {
  return `${normalizeUsername(username)}@${USERNAME_EMAIL_DOMAIN}`;
}

/**
 * Acepta un nombre de usuario o un correo real. Los correos se mantienen
 * para que las cuentas antiguas sigan pudiendo iniciar sesión.
 */
export function loginIdentifierToEmail(identifier: string): string {
  const clean = identifier.trim();
  return clean.includes("@") ? clean.toLowerCase() : usernameToEmail(clean);
}

/** true si el valor parece un correo y no un nombre de usuario. */
export function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}
