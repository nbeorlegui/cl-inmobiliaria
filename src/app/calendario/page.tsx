"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import EventModal from "@/components/event-modal";
import DayEventsPopover from "@/components/day-events-popover";
import { APP_MENU } from "@/lib/app-menu";
import {
  createEventInSheets,
  deleteEventInSheets,
  listEventsFromSheets,
  listUsersFromSheets,
  updateEventInSheets,
} from "@/lib/calendar-api";
import { clearSessionUser, getSessionUser, type SessionUser } from "@/lib/auth";
import { getCachedData, setCachedData } from "@/lib/view-cache";
import { AppUser, CalendarEvent, EventFormValues } from "@/types/calendar";

const WEEK_DAYS_SHORT = ["L", "Ma", "Mi", "J", "V", "S", "D"];
const MONTH_NAMES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sept",
  "oct",
  "nov",
  "dic",
];
const ITEMS_PER_PAGE = 5;

type ToastState = {
  open: boolean;
  message: string;
  tone: "success" | "error";
};

type CalendarCachePayload = {
  users: AppUser[];
  events: CalendarEvent[];
};

function getTypeChipClasses(type: CalendarEvent["type"]) {
  switch (type) {
    case "visita":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "llamada":
      return "border-violet-100 bg-violet-50 text-violet-700";
    case "reunion":
      return "border-cyan-100 bg-cyan-50 text-cyan-700";
    case "tarea":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-indigo-100 bg-indigo-50 text-indigo-700";
  }
}

function getTypeBadgeClasses(type: CalendarEvent["type"]) {
  switch (type) {
    case "visita":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "llamada":
      return "bg-violet-50 text-violet-700 border-violet-100";
    case "reunion":
      return "bg-cyan-50 text-cyan-700 border-cyan-100";
    case "tarea":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-indigo-50 text-indigo-700 border-indigo-100";
  }
}

function parseSafeDate(dateStr?: string | null) {
  if (!dateStr || typeof dateStr !== "string") return null;

  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T12:00:00`
    : trimmed;

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeDateToYmd(value?: string | null) {
  const date = parseSafeDate(value);
  if (!date) return "";
  return toYmd(date);
}

function normalizeTimeValue(value?: string | null) {
  if (!value || typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  return trimmed;
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(dateStr: string) {
  const normalized = normalizeDateToYmd(dateStr);
  if (!normalized) return "-";

  const date = parseSafeDate(normalized);
  if (!date) return "-";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function toYmd(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCalendarDays(currentMonth: Date) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstDayIndex = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  for (let i = firstDayIndex; i > 0; i--) {
    const date = new Date(year, month, 1 - i);
    days.push({ date, isCurrentMonth: false });
  }

  for (let day = 1; day <= totalDays; day++) {
    days.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    days.push({ date, isCurrentMonth: false });
  }

  return days;
}

function sessionToAppUser(user: SessionUser): AppUser {
  return {
    id: user.id,
    name: user.nombre_apellido,
    role: user.rol === "admin" ? "admin" : "seller",
  };
}

function mapUserToAppUser(user: {
  id: string;
  nombre_apellido: string;
  rol: string;
}): AppUser {
  return {
    id: user.id,
    name: user.nombre_apellido,
    role: user.rol === "admin" ? "admin" : "seller",
  };
}

function mapRemoteEventToCalendarEvent(event: {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
  priority: string;
  assignedUserId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}): CalendarEvent {
  const normalizedType =
    event.type === "visita" ||
    event.type === "llamada" ||
    event.type === "reunion" ||
    event.type === "tarea"
      ? event.type
      : "otro";

  return {
    id: event.id,
    title: event.title,
    description: event.description || "",
    date: normalizeDateToYmd(event.date),
    time: normalizeTimeValue(event.time),
    type: normalizedType,
    urgent: event.priority === "alta",
    assignedUserId: event.assignedUserId,
    assignedUserName: "",
    createdById: event.createdById,
    createdByName: "",
    createdAt: event.createdAt || "",
    updatedAt: event.updatedAt || "",
  };
}

function buildOptimisticEvent(
  values: EventFormValues,
  sessionUser: AppUser,
  users: AppUser[]
): CalendarEvent {
  const assignedUser = users.find((u) => u.id === values.assignedUserId);

  return {
    id: `tmp_${crypto.randomUUID()}`,
    title: values.title.trim(),
    description: values.description.trim(),
    date: values.date,
    time: values.time,
    type: values.type,
    urgent: values.urgent,
    assignedUserId: values.assignedUserId,
    assignedUserName: assignedUser?.name || "",
    createdById: sessionUser.id,
    createdByName: sessionUser.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function Toast({ open, message, tone }: ToastState) {
  if (!open) return null;

  const toneClasses =
    tone === "success"
      ? "border-emerald-100 bg-white text-slate-900"
      : "border-red-100 bg-white text-slate-900";

  const iconClasses =
    tone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-red-100 text-red-700";

  const icon = tone === "success" ? "✓" : "!";

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120]">
      <div
        className={`flex min-w-[260px] items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ${toneClasses}`}
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${iconClasses}`}
        >
          {icon}
        </span>
        <div className="text-sm font-medium">{message}</div>
      </div>
    </div>
  );
}

export default function CalendarioPage() {
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [sessionUser, setSessionUser] = useState<AppUser | null>(null);
  const [sessionData, setSessionData] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedDate, setSelectedDate] = useState(toYmd(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverDate, setPopoverDate] = useState("");
  const [popoverAnchorRect, setPopoverAnchorRect] = useState<DOMRect | null>(null);

  const [tablePage, setTablePage] = useState(1);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    tone: "success",
  });

  function showToast(message: string, tone: "success" | "error" = "success") {
    setToast({ open: true, message, tone });
    window.setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 2000);
  }

  function getCalendarCacheKey(user: SessionUser) {
    return `calendar:${user.id}:${user.rol}`;
  }

  async function loadForSession(user: SessionUser) {
    setLoading(true);

    const appUser = sessionToAppUser(user);
    setSessionUser(appUser);
    setSessionData(user);

    const usersRes = await listUsersFromSheets();
    const rawUsers = (usersRes.users || []).map(mapUserToAppUser);
    setUsers(rawUsers);

    const eventsRes = await listEventsFromSheets(appUser.id, appUser.role);
    const mappedEvents = (eventsRes.events || []).map(mapRemoteEventToCalendarEvent);

    const usersMap = new Map(rawUsers.map((u) => [u.id, u]));
    const enriched = mappedEvents.map((event) => ({
      ...event,
      assignedUserName: usersMap.get(event.assignedUserId)?.name || "",
      createdByName: usersMap.get(event.createdById)?.name || "",
    }));

    setEvents(enriched);
    setCachedData<CalendarCachePayload>(getCalendarCacheKey(user), {
      users: rawUsers,
      events: enriched,
    });
    setLoading(false);
  }

  async function refreshEventsOnly(user: SessionUser, knownUsers?: AppUser[]) {
    const appUser = sessionToAppUser(user);
    const eventsRes = await listEventsFromSheets(appUser.id, appUser.role);
    const mappedEvents = (eventsRes.events || []).map(mapRemoteEventToCalendarEvent);
    const baseUsers = knownUsers || users;
    const usersMap = new Map(baseUsers.map((u) => [u.id, u]));

    const enriched = mappedEvents.map((event) => ({
      ...event,
      assignedUserName: usersMap.get(event.assignedUserId)?.name || "",
      createdByName: usersMap.get(event.createdById)?.name || "",
    }));

    setEvents(enriched);
    setCachedData<CalendarCachePayload>(getCalendarCacheKey(user), {
      users: baseUsers,
      events: enriched,
    });
  }

  useEffect(() => {
    const session = getSessionUser();

    if (!session) {
      router.replace("/login");
      return;
    }

    const cache = getCachedData<CalendarCachePayload>(getCalendarCacheKey(session));
    if (cache) {
      setUsers(cache.users);
      setEvents(cache.events);
      setSessionUser(sessionToAppUser(session));
      setSessionData(session);
      setLoading(false);
    }

    loadForSession(session);
  }, [router]);

  const visibleEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateCompare = (a.date || "").localeCompare(b.date || "");
      if (dateCompare !== 0) return dateCompare;
      return (a.time ?? "").localeCompare(b.time ?? "");
    });
  }, [events]);

  const groupedEvents = useMemo(() => {
    return visibleEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      if (!event.date) return acc;
      if (!acc[event.date]) acc[event.date] = [];
      acc[event.date].push(event);
      return acc;
    }, {});
  }, [visibleEvents]);

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const totalPages = Math.max(1, Math.ceil(visibleEvents.length / ITEMS_PER_PAGE));
  const paginatedEvents = visibleEvents.slice(
    (tablePage - 1) * ITEMS_PER_PAGE,
    tablePage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (tablePage > totalPages) {
      setTablePage(totalPages);
    }
  }, [tablePage, totalPages]);

  function openCreateModal(date: string) {
    setSelectedDate(date);
    setSelectedEvent(null);
    setModalMode("create");
    setModalOpen(true);
  }

  function openEditModal(event: CalendarEvent) {
    setSelectedDate(event.date);
    setSelectedEvent(event);
    setModalMode("edit");
    setModalOpen(true);
  }

  async function handleCreate(values: EventFormValues) {
    if (!sessionUser || !sessionData) return;

    if (!values.title.trim() || !values.date.trim() || !values.assignedUserId.trim()) {
      alert("Completá título, fecha y usuario asignado.");
      return;
    }

    const optimisticEvent = buildOptimisticEvent(values, sessionUser, users);
    const optimisticEvents = [...events, optimisticEvent];

    setEvents(optimisticEvents);
    setCachedData<CalendarCachePayload>(getCalendarCacheKey(sessionData), {
      users,
      events: optimisticEvents,
    });
    setModalOpen(false);
    setSelectedEvent(null);
    showToast("Evento creado correctamente", "success");

    try {
      const res = await createEventInSheets({
        tipo_accion: values.type,
        titulo: values.title.trim(),
        descripcion: values.description.trim(),
        fecha: values.date,
        hora_inicio: values.time,
        hora_fin: "",
        prioridad: values.urgent ? "alta" : "normal",
        estado: "pendiente",
        usuario_asignado_id: values.assignedUserId,
        creado_por_id: sessionUser.id,
        contacto_id: "",
        cliente_id: "",
        propiedad_id: "",
        comentario_resultado: "",
      });

      if (!res?.ok) {
        throw new Error(res?.error || "No se pudo guardar el evento");
      }

      await refreshEventsOnly(sessionData, users);
    } catch (error) {
      const reverted = events;
      setEvents(reverted);
      setCachedData<CalendarCachePayload>(getCalendarCacheKey(sessionData), {
        users,
        events: reverted,
      });
      showToast(
        error instanceof Error ? error.message : "No se pudo guardar el evento",
        "error"
      );
    }
  }

  async function handleUpdate(eventId: string, values: EventFormValues) {
    if (!sessionUser || !sessionData) return;

    if (!values.title.trim() || !values.date.trim() || !values.assignedUserId.trim()) {
      alert("Completá título, fecha y usuario asignado.");
      return;
    }

    const previousEvents = events;
    const assignedUser = users.find((u) => u.id === values.assignedUserId);

    const optimisticEvents = previousEvents.map((event) =>
      event.id === eventId
        ? {
            ...event,
            title: values.title.trim(),
            description: values.description.trim(),
            date: values.date,
            time: values.time,
            type: values.type,
            urgent: values.urgent,
            assignedUserId: values.assignedUserId,
            assignedUserName: assignedUser?.name || event.assignedUserName,
            updatedAt: new Date().toISOString(),
          }
        : event
    );

    setEvents(optimisticEvents);
    setCachedData<CalendarCachePayload>(getCalendarCacheKey(sessionData), {
      users,
      events: optimisticEvents,
    });

    setModalOpen(false);
    setSelectedEvent(null);
    showToast("Evento actualizado correctamente", "success");

    try {
      const res = await updateEventInSheets({
        id: eventId,
        tipo_accion: values.type,
        titulo: values.title.trim(),
        descripcion: values.description.trim(),
        fecha: values.date,
        hora_inicio: values.time,
        prioridad: values.urgent ? "alta" : "normal",
        usuario_asignado_id: values.assignedUserId,
      });

      if (!res?.ok) {
        throw new Error(res?.error || "No se pudo actualizar el evento");
      }

      await refreshEventsOnly(sessionData, users);
    } catch (error) {
      setEvents(previousEvents);
      setCachedData<CalendarCachePayload>(getCalendarCacheKey(sessionData), {
        users,
        events: previousEvents,
      });
      showToast(
        error instanceof Error ? error.message : "No se pudo actualizar el evento",
        "error"
      );
    }
  }

  async function handleDelete(eventId: string) {
    if (!sessionData) return;

    const previousEvents = events;
    const optimisticEvents = previousEvents.filter((event) => event.id !== eventId);

    setEvents(optimisticEvents);
    setCachedData<CalendarCachePayload>(getCalendarCacheKey(sessionData), {
      users,
      events: optimisticEvents,
    });

    setModalOpen(false);
    setSelectedEvent(null);
    showToast("Evento eliminado correctamente", "success");

    try {
      const res = await deleteEventInSheets(eventId);

      if (!res?.ok) {
        throw new Error(res?.error || "No se pudo eliminar el evento");
      }

      await refreshEventsOnly(sessionData, users);
    } catch (error) {
      setEvents(previousEvents);
      setCachedData<CalendarCachePayload>(getCalendarCacheKey(sessionData), {
        users,
        events: previousEvents,
      });
      showToast(
        error instanceof Error ? error.message : "No se pudo eliminar el evento",
        "error"
      );
    }
  }

  function handleLogout() {
    clearSessionUser();
    router.replace("/login");
  }

  const mobileMonthIndex = currentMonth.getMonth();

  return (
    <AppShell menu={APP_MENU}>
      <>
        <Toast {...toast} />

        <div className="mb-3 hidden rounded-[24px] border border-white/60 bg-white/85 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl md:block">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                CL Inmobiliaria
              </p>
              <h1 className="mt-1 text-[1.8rem] font-semibold tracking-tight text-slate-900">
                Calendario interno
              </h1>
              <p className="mt-1 max-w-2xl text-[13px] text-slate-500">
                Gestión visual de visitas, llamadas, reuniones y tareas del equipo.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-700">
                {sessionUser?.name || ""} · {sessionUser?.role === "admin" ? "Admin" : "Vendedor"}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        <div className="mb-2 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-[1.05rem] font-semibold capitalize text-slate-900">
              {formatMonthYear(currentMonth)}
            </h1>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-600">
              {sessionUser?.name || ""}
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {MONTH_NAMES.map((month, index) => {
              const isActive = index === mobileMonthIndex;

              return (
                <button
                  key={month}
                  type="button"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), index, 1)
                    )
                  }
                  className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-blue-100 bg-blue-100 text-blue-900"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/60 bg-white/90 p-2 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl md:p-3.5">
          <div className="hidden md:block">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-[1.7rem] font-semibold capitalize text-slate-900">
                  {formatMonthYear(currentMonth)}
                </h2>
                <p className="text-[13px] text-slate-500">Vista mensual del equipo</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-[1px] rounded-[18px] bg-slate-200 overflow-hidden">
            {WEEK_DAYS_SHORT.map((day) => (
              <div
                key={day}
                className="bg-white py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400"
              >
                {day}
              </div>
            ))}

            {calendarDays.map(({ date, isCurrentMonth }) => {
              const dateStr = toYmd(date);
              const dayEvents = groupedEvents[dateStr] ?? [];
              const visibleChips = dayEvents.slice(0, 3);
              const isToday = dateStr === toYmd(new Date());

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    if (dayEvents.length > 0) {
                      openEditModal(dayEvents[0]);
                    } else {
                      openCreateModal(dateStr);
                    }
                  }}
                  className={`min-h-[92px] bg-white px-1 py-1.5 text-left align-top md:min-h-[104px] ${
                    !isCurrentMonth ? "text-slate-400" : ""
                  }`}
                >
                  <div className="mb-1 flex justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                        isToday
                          ? "bg-blue-600 text-white"
                          : isCurrentMonth
                          ? "bg-slate-100 text-slate-700"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {visibleChips.map((event) => (
                      <div
                        key={event.id}
                        className={`truncate rounded-[4px] border px-1 py-[1px] text-[9px] font-semibold md:text-[10px] ${getTypeChipClasses(
                          event.type
                        )}`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}

                    {dayEvents.length > 3 && (
                      <div className="px-1 text-[10px] font-semibold text-slate-500">
                        +{dayEvents.length - 3}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 hidden rounded-[24px] border border-white/60 bg-white/90 p-3.5 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl md:block">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Listado de eventos
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                Todos los eventos
              </h3>
            </div>

            <div className="text-[13px] text-slate-500">
              Página {tablePage} de {totalPages}
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-slate-200">
            <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              <div className="col-span-3">Evento</div>
              <div className="col-span-2">Fecha</div>
              <div className="col-span-2">Hora</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-2">Asignado</div>
              <div className="col-span-1 text-right">Acción</div>
            </div>

            {paginatedEvents.length === 0 ? (
              <div className="px-4 py-7 text-center text-[13px] text-slate-500">
                No hay eventos para mostrar.
              </div>
            ) : (
              paginatedEvents.map((event) => (
                <div
                  key={event.id}
                  className="grid grid-cols-12 gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0"
                >
                  <div className="col-span-3 min-w-0">
                    <p className="truncate text-[13px] font-semibold text-slate-900">
                      {event.title}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {event.description || "Sin descripción"}
                    </p>
                  </div>

                  <div className="col-span-2 text-[13px] text-slate-700">
                    {formatShortDate(event.date)}
                  </div>

                  <div className="col-span-2 text-[13px] text-slate-700">
                    {event.time || "-"}
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getTypeBadgeClasses(
                        event.type
                      )}`}
                    >
                      {event.type}
                    </span>
                    {event.urgent && (
                      <span className="ml-1.5 inline-flex rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                        Urgente
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 text-[13px] text-slate-700">
                    {event.assignedUserName}
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => openEditModal(event)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal(toYmd(new Date()))}
          className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-2xl font-semibold text-white shadow-[0_18px_40px_rgba(59,130,246,0.35)] md:hidden"
          aria-label="Agregar evento"
        >
          +
        </button>

        <EventModal
          open={modalOpen}
          mode={modalMode}
          users={sessionUser?.role === "admin" ? users : sessionUser ? [sessionUser] : []}
          currentUser={sessionUser || { id: "", name: "", role: "seller" }}
          initialDate={selectedDate}
          event={selectedEvent}
          onClose={() => {
            setModalOpen(false);
            setSelectedEvent(null);
          }}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />

        <DayEventsPopover
          open={popoverOpen}
          anchorRect={popoverAnchorRect}
          dateLabel=""
          events={popoverDate ? groupedEvents[popoverDate] ?? [] : []}
          onClose={() => setPopoverOpen(false)}
          onOpenEvent={openEditModal}
        />
      </>
    </AppShell>
  );
}