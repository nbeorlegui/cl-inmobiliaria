import type { Visit } from "@/types";

type VisitsPanelProps = {
  visits: Visit[];
  getUrgencyClasses: (urgency: "Alta" | "Media" | "Baja") => string;
};

export default function VisitsPanel({
  visits,
  getUrgencyClasses,
}: VisitsPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Acciones del día
          </h2>
          <p className="text-sm text-slate-500">
            Visitas, llamadas y seguimientos asignados
          </p>
        </div>

        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Hoy
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {visits.map((visit) => (
          <div
            key={visit.time + visit.client}
            className={`rounded-2xl border border-slate-200 border-l-4 p-4 ${getUrgencyClasses(
              visit.urgency
            )}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {visit.time} · {visit.client}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {visit.property}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Asignado a {visit.agent}
                </div>
              </div>

              <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                {visit.type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}