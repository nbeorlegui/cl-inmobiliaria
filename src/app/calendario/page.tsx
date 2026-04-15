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
import { AppUser, CalendarEvent, EventFormValues } from "@/types/calendar";

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const ITEMS_PER_PAGE = 5;

type ToastState = {
  open: boolean;
  message: string;
  tone: "success" | "error";
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

function formatDateLabel(dateStr: string) {
  const date = parseSafeDate(dateStr);
  if (!date) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
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
        className={`flex min-w-[280px] items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ${toneClasses}`}
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
  }

  useEffect(() => {
    const session = getSessionUser();

    if (!session) {
      router.replace("/login");
      return;
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

  const todayYmd = toYmd(new Date());

  const totalEvents = visibleEvents.length;
  const todayEvents = visibleEvents.filter((event) => event.date === todayYmd).length;
  const urgentEvents = visibleEvents.filter((event) => event.urgent).length;

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

    setEvents((prev) => [...prev, optimisticEvent]);
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
      setEvents((prev) => prev.filter((event) => event.id !== optimisticEvent.id));
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

    setEvents((prev) =>
      prev.map((event) =>
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
      )
    );

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
      showToast(
        error instanceof Error ? error.message : "No se pudo actualizar el evento",
        "error"
      );
    }
  }

  async function handleDelete(eventId: string) {
    if (!sessionData) return;

    const previousEvents = events;
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
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

  return (
    <AppShell menu={APP_MENU}>
      <>
        <Toast {...toast} />

        <div className="mb-3 rounded-[24px] border border-white/60 bg-white/85 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
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
                onClick={() => openCreateModal(todayYmd)}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_12px_26px_rgba(59,130,246,0.22)] transition hover:scale-[1.01]"
              >
                + Nuevo evento
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
              Visita
            </span>
            <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
              Llamada
            </span>
            <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold text-cyan-700">
              Reunión
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
              Tarea
            </span>
            <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-600">
              Urgente
            </span>
          </div>
        </div>

        <div className="mb-3 grid gap-2.5 md:grid-cols-3">
          <div className="rounded-[20px] bg-gradient-to-r from-blue-600 to-blue-500 p-3.5 text-white shadow-[0_10px_24px_rgba(37,99,235,0.16)]">
            <p className="text-[13px] font-medium text-white/80">Total de eventos</p>
            <p className="mt-1.5 text-[2rem] font-semibold">{totalEvents}</p>
            <p className="mt-1 text-[12px] text-white/80">Eventos visibles</p>
          </div>

          <div className="rounded-[20px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-3.5 text-white shadow-[0_10px_24px_rgba(139,92,246,0.18)]">
            <p className="text-[13px] font-medium text-white/80">
              Eventos para hoy {formatShortDate(todayYmd)}
            </p>
            <p className="mt-1.5 text-[2rem] font-semibold">{todayEvents}</p>
            <p className="mt-1 text-[12px] text-white/80">Acciones del día</p>
          </div>

          <div className="rounded-[20px] bg-gradient-to-r from-cyan-500 to-sky-500 p-3.5 text-white shadow-[0_10px_24px_rgba(14,165,233,0.16)]">
            <p className="text-[13px] font-medium text-white/80">Urgentes</p>
            <p className="mt-1.5 text-[2rem] font-semibold">{urgentEvents}</p>
            <p className="mt-1 text-[12px] text-white/80">Prioridad alta</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/60 bg-white/90 p-3.5 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1
                    )
                  )
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                ←
              </button>

              <div>
                <h2 className="text-[1.7rem] font-semibold capitalize text-slate-900">
                  {formatMonthYear(currentMonth)}
                </h2>
                <p className="text-[13px] text-slate-500">Vista mensual del equipo</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1
                    )
                  )
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                →
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCurrentMonth(new Date())}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Hoy
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">Cargando calendario...</div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="rounded-xl bg-slate-50 px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map(({ date, isCurrentMonth }) => {
                const dateStr = toYmd(date);
                const dayEvents = groupedEvents[dateStr] ?? [];
                const visibleChips = dayEvents.slice(0, 2);
                const extraCount = Math.max(dayEvents.length - 2, 0);
                const isToday = dateStr === todayYmd;

                return (
                  <div
                    key={dateStr}
                    onClick={() => openCreateModal(dateStr)}
                    className={`group relative min-h-[104px] cursor-pointer rounded-[18px] border p-2 text-left transition ${
                      isCurrentMonth
                        ? "border-slate-200 bg-white hover:border-blue-200 hover:shadow-[0_10px_22px_rgba(15,23,42,0.05)]"
                        : "border-slate-100 bg-slate-50/80 text-slate-400 hover:border-slate-200"
                    }`}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold ${
                          isToday
                            ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                            : isCurrentMonth
                            ? "bg-slate-100 text-slate-700"
                            : "bg-white text-slate-400"
                        }`}
                      >
                        {date.getDate()}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {visibleChips.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(event);
                          }}
                          className={`block w-full rounded-md border px-1.5 py-1 text-left text-[9px] font-semibold shadow-sm transition hover:opacity-90 ${getTypeChipClasses(
                            event.type
                          )}`}
                        >
                          <div className="truncate">
                            {event.time ? `${event.time} · ` : ""}
                            {event.title}
                          </div>
                        </button>
                      ))}

                      {extraCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPopoverDate(dateStr);
                            setPopoverAnchorRect(
                              (e.currentTarget as HTMLButtonElement).getBoundingClientRect()
                            );
                            setPopoverOpen(true);
                          }}
                          className="inline-flex w-full items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-1.5 py-1 text-[9px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50"
                        >
                          + {extraCount} más
                        </button>
                      )}
                    </div>

                    {dayEvents.length === 0 && (
                      <div className="absolute inset-x-2 bottom-2 rounded-md border border-dashed border-transparent px-1.5 py-1 text-[9px] text-slate-300 opacity-0 transition group-hover:border-slate-200 group-hover:bg-slate-50/80 group-hover:opacity-100">
                        Click para crear evento
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-3 rounded-[24px] border border-white/60 bg-white/90 p-3.5 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Listado de eventos
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                Todos los eventos
              </h3>
              <p className="mt-1 text-[13px] text-slate-500">
                Vista tabular con paginado de 5 registros.
              </p>
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

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              disabled={tablePage === 1}
              onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>

            <div className="text-[13px] text-slate-500">
              {visibleEvents.length} registros totales
            </div>

            <button
              type="button"
              disabled={tablePage === totalPages}
              onClick={() => setTablePage((prev) => Math.min(totalPages, prev + 1))}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>

        <EventModal
          open={modalOpen}
          mode={modalMode}
          users={
            sessionUser?.role === "admin"
              ? users
              : sessionUser
              ? [sessionUser]
              : []
          }
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
          dateLabel={popoverDate ? formatDateLabel(popoverDate) : ""}
          events={popoverDate ? groupedEvents[popoverDate] ?? [] : []}
          onClose={() => setPopoverOpen(false)}
          onOpenEvent={openEditModal}
        />
      </>
    </AppShell>
  );
}