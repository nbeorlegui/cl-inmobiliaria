import { AppUser, CalendarEvent } from "@/types/calendar";

const STORAGE_KEY = "cl-inmobiliaria-calendar-events";
const SESSION_KEY = "cl-inmobiliaria-session-user";

export const MOCK_USERS: AppUser[] = [
  { id: "admin-lorena", name: "Lorena", role: "admin" },
  { id: "admin-agustina", name: "Agustina", role: "admin" },
  { id: "seller-nico", name: "Nicolás", role: "seller" },
  { id: "seller-franco", name: "Franco", role: "seller" },
  { id: "seller-martina", name: "Martina", role: "seller" },
];

function toYmd(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function offsetDate(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function offsetTime(base: string, hours: number, minutes = 0) {
  const [h, m] = base.split(":").map(Number);
  const date = new Date();
  date.setHours(h + hours, m + minutes, 0, 0);
  return `${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;
}

function buildSeedEvents(): CalendarEvent[] {
  const now = new Date();
  const nowIso = now.toISOString();

  const today = toYmd(now);
  const tomorrow = toYmd(offsetDate(now, 1));
  const yesterday = toYmd(offsetDate(now, -1));
  const next2 = toYmd(offsetDate(now, 2));
  const next4 = toYmd(offsetDate(now, 4));

  return [
    {
      id: crypto.randomUUID(),
      title: "Visita a depto Centro",
      description: "Mostrar propiedad de 2 dormitorios con cochera.",
      date: today,
      time: "10:00",
      type: "visita",
      urgent: true,
      assignedUserId: "seller-nico",
      assignedUserName: "Nicolás",
      createdById: "admin-lorena",
      createdByName: "Lorena",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: crypto.randomUUID(),
      title: "Llamar a comprador",
      description: "Seguimiento de reserva y documentación pendiente.",
      date: today,
      time: "12:00",
      type: "llamada",
      urgent: true,
      assignedUserId: "seller-franco",
      assignedUserName: "Franco",
      createdById: "admin-agustina",
      createdByName: "Agustina",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: crypto.randomUUID(),
      title: "Reunión con propietario",
      description: "Definir precio final y condiciones de publicación.",
      date: today,
      time: "16:30",
      type: "reunion",
      urgent: false,
      assignedUserId: "seller-martina",
      assignedUserName: "Martina",
      createdById: "admin-lorena",
      createdByName: "Lorena",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: crypto.randomUUID(),
      title: "Cargar fotos de propiedad",
      description: "Subir material al sistema y validar portada.",
      date: tomorrow,
      time: "09:15",
      type: "tarea",
      urgent: false,
      assignedUserId: "seller-nico",
      assignedUserName: "Nicolás",
      createdById: "admin-lorena",
      createdByName: "Lorena",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: crypto.randomUUID(),
      title: "Contacto con inversor",
      description: "Presentar oportunidad en complejo de pozo.",
      date: next2,
      time: "11:30",
      type: "reunion",
      urgent: true,
      assignedUserId: "seller-franco",
      assignedUserName: "Franco",
      createdById: "admin-lorena",
      createdByName: "Lorena",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: crypto.randomUUID(),
      title: "Actualizar ficha de propiedad",
      description: "Modificar amenities y datos de superficie.",
      date: yesterday,
      time: "18:00",
      type: "tarea",
      urgent: false,
      assignedUserId: "seller-martina",
      assignedUserName: "Martina",
      createdById: "admin-agustina",
      createdByName: "Agustina",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: crypto.randomUUID(),
      title: "Visita barrio privado",
      description: "Recorrido con cliente interesado en lote premium.",
      date: next4,
      time: "17:00",
      type: "visita",
      urgent: false,
      assignedUserId: "seller-nico",
      assignedUserName: "Nicolás",
      createdById: "admin-lorena",
      createdByName: "Lorena",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];
}

export function getMockSessionUser(): AppUser {
  if (typeof window === "undefined") {
    return MOCK_USERS[0];
  }

  const raw = window.localStorage.getItem(SESSION_KEY);

  if (!raw) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(MOCK_USERS[0]));
    return MOCK_USERS[0];
  }

  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(MOCK_USERS[0]));
    return MOCK_USERS[0];
  }
}

export function setMockSessionUser(userId: string) {
  if (typeof window === "undefined") return;
  const user = MOCK_USERS.find((u) => u.id === userId) ?? MOCK_USERS[0];
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getStoredEvents(): CalendarEvent[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const seed = buildSeedEvents();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as CalendarEvent[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = buildSeedEvents();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    const seed = buildSeedEvents();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

export function saveStoredEvents(events: CalendarEvent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function resetSeedEvents() {
  if (typeof window === "undefined") return;
  const seed = buildSeedEvents();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
}

export function getVisibleEventsForUser(events: CalendarEvent[], user: AppUser) {
  if (user.role === "admin") return events;
  return events.filter((event) => event.assignedUserId === user.id);
}

export function buildEventTypeLabel(type: CalendarEvent["type"]) {
  switch (type) {
    case "visita":
      return "Visita";
    case "llamada":
      return "Llamada";
    case "reunion":
      return "Reunión";
    case "tarea":
      return "Tarea";
    default:
      return "Otro";
  }
}