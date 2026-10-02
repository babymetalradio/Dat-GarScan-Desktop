const KEY_TOKEN = "datgar_token";
const KEY_USER = "datgar_username";
const KEY_ROLE = "datgar_role";

export type Sesion = {
  token: string;
  username: string;
  role: string | null;
};

export function cargarSesion(): Sesion | null {
  try {
    const token = localStorage.getItem(KEY_TOKEN)?.trim();
    const username = localStorage.getItem(KEY_USER);
    if (!token || !username) return null;
    return {
      token,
      username,
      role: localStorage.getItem(KEY_ROLE),
    };
  } catch {
    return null;
  }
}

export function guardarSesion(
  token: string,
  username: string,
  role?: string | null
) {
  const t = token.trim();
  if (!t) {
    cerrarSesion();
    return;
  }
  localStorage.setItem(KEY_TOKEN, t);
  localStorage.setItem(KEY_USER, username);
  if (role) localStorage.setItem(KEY_ROLE, role);
  else localStorage.removeItem(KEY_ROLE);
}

export function cerrarSesion() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_USER);
  localStorage.removeItem(KEY_ROLE);
}

export function getToken(): string | null {
  return cargarSesion()?.token ?? null;
}
