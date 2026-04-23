"use client";

import { useEffect } from "react";
import type { CalendarEvent } from "@/types/calendar";

type DayEventsPopoverProps = {
  open: boolean;
  anchorRect: DOMRect | null;
  dateLabel: string;
  events: CalendarEvent[];
  onClose: () => void;
  onOpenEvent: (event: CalendarEvent) => void;
};

function getTypeLabel(type: CalendarEvent["type"]) {
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
      return "Acción";
  }
}

function getTypeBadgeClasses(type: CalendarEvent["type"]) {
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

export default function DayEventsPopover({
  open,
  dateLabel,
  events,
  onClose,
  onOpenEvent,
}: DayEventsPopoverProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-950/35 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 md:p-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.20)] md:max-w-md"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Eventos del día
              </p>
              <h3 className="mt-1 text-[1.1rem] font-semibold text-slate-900">
                {dateLabel || "Eventos"}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[62dvh] overflow-y-auto p-3 md:max-h-[70dvh]">
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No hay eventos para este día.
                </div>
              ) : (
                events.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onOpenEvent(event)}
                    className="block w-full rounded-[18px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[1rem] font-semibold text-slate-900">
                          {event.title}
                        </p>
                        <p className="mt-1 text-[12px] text-slate-500">
                          {event.time || "--:--"} · {event.assignedUserName || "Sin asignar"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getTypeBadgeClasses(
                          event.type
                        )}`}
                      >
                        {getTypeLabel(event.type)}
                      </span>
                    </div>

                    {event.description ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {event.description}
                      </p>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}