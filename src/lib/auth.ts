export type SessionUser = {
  id: string;
  nombre_apellido: string;
  email: string;
  telefono: string;
  usuario: string;
  rol: string;
  color_calendario: string;
  estado: string;
};

const SESSION_KEY = "cl-session-user";

export function saveSessionUser(user: SessionUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function clearSessionUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn() {
  return !!getSessionUser();
}

/* Compatibilidad con código anterior */
export function clearSession() {
  clearSessionUser();
}

export function getCurrentSessionUser() {
  return getSessionUser();
}

export function getSession() {
  return getSessionUser();
}

export function saveSession(user: SessionUser) {
  saveSessionUser(user);
}