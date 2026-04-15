import type { SessionUser } from "@/types";

type CalendarEvent = {
  id: string;
  title: string;
  type: string;
  date: string;
  start: string;
  end: string;
  assignedTo: string;
  assignedToId: string;
  priority: "alta" | "media" | "baja";
  status: "pendiente" | "confirmada" | "realizada";
  related: string;
};

type CalendarViewProps = {
  user: SessionUser;
};

const allEvents: CalendarEvent[] = [
  {
    id: "ACC-001",
    title: "Visita Casa Chacras",
    type: "visita",
    date: "2026-04-08",
    start: "09:00",
    end: "10:00",
    assignedTo: "Lucía Pérez",
    assignedToId: "USR-003",
    priority: "alta",
    status: "confirmada",
    related: "María Gómez · Casa Chacras",
  },
  {
    id: "ACC-002",
    title: "Llamada seguimiento",
    type: "llamada",
    date: "2026-04-08",
    start: "10:30",
    end: "11:00",
    assignedTo: "Tomás Díaz",
    assignedToId: "USR-003",
    priority: "media",
    status: "pendiente",
    related: "Carlos Ruiz · Departamento Centro",
  },
  {
    id: "ACC-003",
    title: "Tasación propiedad",
    type: "tasacion",
    date: "2026-04-08",
    start: "12:00",
    end: "13:00",
    assignedTo: "Lorena",
    assignedToId: "USR-001",
    priority: "alta",
    status: "confirmada",
    related: "Propietario nuevo · Palmares",
  },
  {
    id: "ACC-004",
    title: "Seguimiento inversor",
    type: "seguimiento",
    date: "2026-04-08",
    start: "16:30",
    end: "17:00",
    assignedTo: "Agustina",
    assignedToId: "USR-002",
    priority: "baja",
    status: "realizada",
    related: "Grupo Andino · Lote Maipú",
  },
];

function getPriorityClass(priority: CalendarEvent["priority"]) {
  if (priority === "alta") return "bg-red-50 text-red-600";
  if (priority === "media") return "bg-amber-50 text-amber-600";
  return "bg-emerald-50 text-emerald-600";
}

function getStatusClass(status: CalendarEvent["status"]) {
  if (status === "pendiente") return "bg-slate-100 text-slate-600";
  if (status === "confirmada") return "bg-blue-50 text-blue-600";
  return "bg-emerald-50 text-emerald-600";
}

export default function CalendarView({ user }: CalendarViewProps) {
  const events =
    user.rol === "admin"
      ? allEvents
      : allEvents.filter((event) => event.assignedToId === user.id);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Agenda de hoy
              </h2>
              <p className="text-sm text-slate-500">
                {user.rol === "admin"
                  ? "Vista completa del equipo."
                  : "Solo tus eventos asignados."}
              </p>
            </div>

            <button className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:opacity-95">
              Nuevo evento
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {events.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No hay eventos asignados para este usuario.
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {event.start} - {event.end} · {event.title}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {event.related}
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Asignado a {event.assignedTo}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getPriorityClass(
                          event.priority
                        )}`}
                      >
                        {event.priority}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
                        {event.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
          <p className="text-sm text-slate-500">
            Estado rápido del calendario.
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-blue-50 p-4">
              <div className="text-2xl font-semibold text-blue-600">
                {events.length}
              </div>
              <div className="mt-1 text-sm font-medium text-blue-600">
                Eventos visibles
              </div>
            </div>

            <div className="rounded-2xl bg-red-50 p-4">
              <div className="text-2xl font-semibold text-red-600">
                {events.filter((e) => e.priority === "alta").length}
              </div>
              <div className="mt-1 text-sm font-medium text-red-600">
                Prioridad alta
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="text-2xl font-semibold text-emerald-600">
                {events.filter((e) => e.status === "confirmada").length}
              </div>
              <div className="mt-1 text-sm font-medium text-emerald-600">
                Confirmados
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Próximos eventos
            </h2>
            <p className="text-sm text-slate-500">
              Vista tipo lista para seguimiento rápido.
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs uppercase tracking-wide text-slate-500">
            <div className="col-span-2">Fecha</div>
            <div className="col-span-2">Horario</div>
            <div className="col-span-3">Evento</div>
            <div className="col-span-2">Asignado</div>
            <div className="col-span-1">Prioridad</div>
            <div className="col-span-2">Estado</div>
          </div>

          {events.map((event) => (
            <div
              key={event.id}
              className="grid grid-cols-12 items-center border-t border-slate-200 px-4 py-4 text-sm"
            >
              <div className="col-span-2 text-slate-700">{event.date}</div>
              <div className="col-span-2 text-slate-700">
                {event.start} - {event.end}
              </div>
              <div className="col-span-3">
                <div className="font-medium text-slate-900">{event.title}</div>
                <div className="mt-1 text-xs text-slate-500">{event.related}</div>
              </div>
              <div className="col-span-2 text-slate-700">{event.assignedTo}</div>
              <div className="col-span-1">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getPriorityClass(
                    event.priority
                  )}`}
                >
                  {event.priority}
                </span>
              </div>
              <div className="col-span-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                    event.status
                  )}`}
                >
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}