"use client";

import { useEffect, useMemo, useState } from "react";
import { AppUser, CalendarEvent, EventFormValues } from "@/types/calendar";

type EventModalProps = {
  open: boolean;
  mode: "create" | "edit";
  users: AppUser[];
  currentUser: AppUser;
  initialDate: string;
  event: CalendarEvent | null;
  onClose: () => void;
  onCreate: (values: EventFormValues) => void;
  onUpdate: (eventId: string, values: EventFormValues) => void;
  onDelete: (eventId: string) => void;
};

const EVENT_TYPE_OPTIONS: Array<{
  value: EventFormValues["type"];
  label: string;
}> = [
  { value: "visita", label: "Visita" },
  { value: "llamada", label: "Llamada" },
  { value: "reunion", label: "Reunión" },
  { value: "tarea", label: "Tarea" },
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0")
);

const MINUTE_OPTIONS = [
  "00",
  "05",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
];

const EMPTY_VALUES: EventFormValues = {
  title: "",
  description: "",
  date: "",
  time: "",
  type: "visita",
  urgent: false,
  assignedUserId: "",
};

function splitTimeValue(time?: string) {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    return { hour: "", minute: "" };
  }

  const [hour, minute] = time.split(":");
  return {
    hour: hour || "",
    minute: minute || "",
  };
}

export default function EventModal({
  open,
  mode,
  users,
  currentUser,
  initialDate,
  event,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: EventModalProps) {
  const [values, setValues] = useState<EventFormValues>(EMPTY_VALUES);
  const [hourValue, setHourValue] = useState("");
  const [minuteValue, setMinuteValue] = useState("");

  const assignableUsers = useMemo(() => {
    if (currentUser.role === "admin") return users;
    return users.filter((user) => user.id === currentUser.id);
  }, [users, currentUser]);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && event) {
      const timeParts = splitTimeValue(event.time);

      setValues({
        title: event.title || "",
        description: event.description || "",
        date: event.date || initialDate || "",
        time: event.time || "",
        type:
          event.type === "visita" ||
          event.type === "llamada" ||
          event.type === "reunion" ||
          event.type === "tarea"
            ? event.type
            : "visita",
        urgent: !!event.urgent,
        assignedUserId:
          event.assignedUserId ||
          assignableUsers[0]?.id ||
          currentUser.id ||
          "",
      });

      setHourValue(timeParts.hour);
      setMinuteValue(timeParts.minute);
      return;
    }

    setValues({
      ...EMPTY_VALUES,
      date: initialDate || "",
      assignedUserId: assignableUsers[0]?.id || currentUser.id || "",
    });
    setHourValue("");
    setMinuteValue("");
  }, [open, mode, event, initialDate, assignableUsers, currentUser]);

  if (!open) return null;

  function updateField<K extends keyof EventFormValues>(
    field: K,
    value: EventFormValues[K]
  ) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateTime(nextHour: string, nextMinute: string) {
    setHourValue(nextHour);
    setMinuteValue(nextMinute);

    if (nextHour && nextMinute) {
      updateField("time", `${nextHour}:${nextMinute}`);
    } else {
      updateField("time", "");
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (mode === "edit" && event) {
      onUpdate(event.id, values);
      return;
    }

    onCreate(values);
  }

  function handleDelete() {
    if (!event) return;
    const ok = window.confirm("¿Querés eliminar este evento?");
    if (!ok) return;
    onDelete(event.id);
  }

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/45 backdrop-blur-[2px]">
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
        <div className="flex h-[78dvh] w-full max-w-lg flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:h-auto sm:max-h-[88dvh] sm:rounded-[28px]">
          <div className="shrink-0 border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-blue-50 px-4 py-3 sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  CL Inmobiliaria
                </p>
                <h2 className="mt-1 text-[1.1rem] font-semibold text-slate-900 sm:text-2xl">
                  {mode === "edit" ? "Editar evento" : "Nuevo evento"}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Título
                  </label>
                  <input
                    value={values.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="Ej. Visita a propiedad"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={values.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Horario
                  </label>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <select
                      value={hourValue}
                      onChange={(e) => updateTime(e.target.value, minuteValue)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Hora</option>
                      {HOUR_OPTIONS.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>

                    <span className="text-center text-lg font-semibold text-slate-400">
                      :
                    </span>

                    <select
                      value={minuteValue}
                      onChange={(e) => updateTime(hourValue, e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Min</option>
                      {MINUTE_OPTIONS.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tipo de evento
                  </label>
                  <select
                    value={values.type}
                    onChange={(e) =>
                      updateField(
                        "type",
                        e.target.value as EventFormValues["type"]
                      )
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  >
                    {EVENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Asignado a
                  </label>
                  <select
                    value={values.assignedUserId}
                    onChange={(e) => updateField("assignedUserId", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  >
                    {assignableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} · {user.role === "admin" ? "Admin" : "Vendedor"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    value={values.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="Detalle del evento..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={values.urgent}
                      onChange={(e) => updateField("urgent", e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Marcar como urgente
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex flex-col gap-3">
                {mode === "edit" && event && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(59,130,246,0.28)] transition"
                  >
                    {mode === "edit" ? "Guardar" : "Crear"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}