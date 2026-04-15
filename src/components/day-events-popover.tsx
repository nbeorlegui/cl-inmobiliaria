"use client";

import { CalendarEvent } from "@/types/calendar";
import { buildEventTypeLabel } from "@/lib/calendar-store";

type DayEventsPopoverProps = {
  open: boolean;
  anchorRect: DOMRect | null;
  dateLabel: string;
  events: CalendarEvent[];
  onClose: () => void;
  onOpenEvent: (event: CalendarEvent) => void;
};

function getTypeClasses(type: CalendarEvent["type"]) {
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

export default function DayEventsPopover({
  open,
  anchorRect,
  dateLabel,
  events,
  onClose,
  onOpenEvent,
}: DayEventsPopoverProps) {
  if (!open || !anchorRect) return null;

  const top = anchorRect.bottom + window.scrollY + 8;
  const left = Math.min(
    anchorRect.left + window.scrollX,
    window.innerWidth - 360
  );

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="fixed inset-0 z-[58] cursor-default bg-transparent"
      />

      <div
        className="absolute z-[60] w-[340px] rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.16)]"
        style={{ top, left }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Eventos del día
            </p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">
              {dateLabel}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
          {events.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => {
                onOpenEvent(event);
                onClose();
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {event.time ? `${event.time} · ` : ""}
                    {event.assignedUserName}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getTypeClasses(
                    event.type
                  )}`}
                >
                  {buildEventTypeLabel(event.type)}
                </span>
              </div>

              {event.description && (
                <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                  {event.description}
                </p>
              )}

              {event.urgent && (
                <div className="mt-2">
                  <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                    Urgente
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}