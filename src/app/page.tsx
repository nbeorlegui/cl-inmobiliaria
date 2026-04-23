"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { APP_MENU } from "@/lib/app-menu";
import { clearSessionUser, getSessionUser, type SessionUser } from "@/lib/auth";
import {
  getDashboardDataFromSheets,
  type DashboardAction,
  type DashboardProperty,
  type DashboardSummary,
} from "@/lib/calendar-api";

function getAlertClasses(level: DashboardAction["alertLevel"]) {
  switch (level) {
    case "red":
      return {
        card: "border-red-200 bg-red-50/70",
        bar: "bg-red-500",
        badge: "border-red-200 bg-white text-red-600",
      };
    case "yellow":
      return {
        card: "border-amber-200 bg-amber-50/70",
        bar: "bg-amber-400",
        badge: "border-amber-200 bg-white text-amber-700",
      };
    case "green":
      return {
        card: "border-emerald-200 bg-emerald-50/70",
        bar: "bg-emerald-500",
        badge: "border-emerald-200 bg-white text-emerald-700",
      };
    default:
      return {
        card: "border-slate-200 bg-slate-50/70",
        bar: "bg-slate-300",
        badge: "border-slate-200 bg-white text-slate-600",
      };
  }
}

function getTypeLabel(type: string) {
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

function getKpiText(role: string) {
  return role === "admin"
    ? {
        title: "Vista general del sistema con métricas globales.",
        properties: "Propiedades activas",
        events: "Eventos de hoy",
        urgent: "Urgentes",
        upcoming: "Próximos a vencer",
        actionsTitle: "Acciones del equipo",
        propertiesTitle: "Propiedades recientes",
      }
    : {
        title: "Vista personal con acceso solo a tus módulos asignados.",
        properties: "Propiedades asignadas",
        events: "Eventos de hoy",
        urgent: "Urgentes",
        upcoming: "Próximos a vencer",
        actionsTitle: "Mis acciones",
        propertiesTitle: "Mis propiedades asignadas",
      };
}
function normalizeDateOnly(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function isActionExpired(action: DashboardAction) {
  const actionDate = normalizeDateOnly(action.date);
  if (!actionDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return actionDate.getTime() < today.getTime();
}

export default function HomePage() {
  const router = useRouter();

  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [summary, setSummary] = useState<DashboardSummary>({
    totalProperties: 0,
    todayEvents: 0,
    urgentEvents: 0,
    upcomingEvents: 0,
  });

  const [actions, setActions] = useState<DashboardAction[]>([]);
  const [properties, setProperties] = useState<DashboardProperty[]>([]);

useEffect(() => {
  const currentSession = getSessionUser();

  if (!currentSession) {
    router.replace("/login");
    return;
  }

  const userId: string = currentSession.id;
  const userRole: string = currentSession.rol;

  setSession(currentSession);

  async function loadDashboard() {
    try {
      setFetchError("");

      const res = await getDashboardDataFromSheets(userId, userRole);

      if (!res.ok) {
        throw new Error(res.error || "No se pudo cargar el dashboard");
      }

      setSummary(
        res.summary || {
          totalProperties: 0,
          todayEvents: 0,
          urgentEvents: 0,
          upcomingEvents: 0,
        }
      );

      setActions(res.todayActions || []);
      setProperties(res.properties || []);
    } catch (error) {
      setFetchError(
        error instanceof Error ? error.message : "No se pudo cargar el dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  loadDashboard();
}, [router]);

const greetingName = useMemo(() => {
  if (!session?.nombre_apellido) return "";
  return session.nombre_apellido.split(" ")[0] || session.nombre_apellido;
}, [session]);

if (!session) return null;

const labels = getKpiText(session.rol);
const currentUserName = session.nombre_apellido.trim().toLowerCase();

const myActions = actions.filter(
  (action) => (action.assignedUserName || "").trim().toLowerCase() === currentUserName
);

const myActiveActions = myActions.filter((action) => !isActionExpired(action));
const myExpiredActions = myActions.filter((action) => isActionExpired(action));

const teamActions = actions.filter(
  (action) => (action.assignedUserName || "").trim().toLowerCase() !== currentUserName
);

function renderActionCard(
  action: DashboardAction,
  showAssignedUser: boolean
) {
  const styles = getAlertClasses(action.alertLevel);

  return (
    <div
      key={action.id}
      className={`relative overflow-hidden rounded-[20px] border p-4 ${styles.card}`}
    >
      <div className={`absolute inset-y-0 left-0 w-1.5 ${styles.bar}`} />

      <div className="ml-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[28px] font-semibold leading-none tracking-tight text-slate-900">
            {action.time || "--:--"}
          </span>

          <span className="text-[28px] font-semibold leading-none tracking-tight text-slate-900">
            {action.date || "-"}
          </span>

          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${styles.badge}`}
          >
            {getTypeLabel(action.type)}
          </span>
        </div>

        <p className="mt-3 text-[18px] font-semibold text-slate-900">
          {action.title || "Sin título"}
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {action.description || "Sin descripción"}
        </p>

        {showAssignedUser && action.assignedUserName && (
          <p className="mt-2 text-[13px] text-slate-500">
            Asignado a {action.assignedUserName}
          </p>
        )}
      </div>
    </div>
  );
}

function handleLogout() {
  clearSessionUser();
  router.replace("/login");
}

  return (
    <AppShell menu={APP_MENU}>
      <>
        <div className="mb-3 rounded-[24px] border border-white/60 bg-white/85 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Dashboard
              </p>
              <h1 className="mt-1 text-[1.8rem] font-semibold tracking-tight text-slate-900">
                Bienvenida, {greetingName}
              </h1>
              <p className="mt-1 max-w-2xl text-[13px] text-slate-500">
                {labels.title}
              </p>
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

        {fetchError && (
          <div className="mb-3 rounded-[20px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {fetchError}
          </div>
        )}

        <div className="mb-3 grid gap-2.5 md:grid-cols-4">
          <div className="rounded-[20px] bg-gradient-to-r from-blue-600 to-blue-500 p-3.5 text-white shadow-[0_10px_24px_rgba(37,99,235,0.16)]">
            <p className="text-[13px] font-medium text-white/80">{labels.properties}</p>
            <p className="mt-1.5 text-[2rem] font-semibold">{summary.totalProperties}</p>
          </div>

          <div className="rounded-[20px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-3.5 text-white shadow-[0_10px_24px_rgba(139,92,246,0.18)]">
            <p className="text-[13px] font-medium text-white/80">{labels.events}</p>
            <p className="mt-1.5 text-[2rem] font-semibold">{summary.todayEvents}</p>
            <p className="mt-1 text-[12px] text-white/80">Con fecha de hoy</p>
          </div>

          <div className="rounded-[20px] bg-gradient-to-r from-rose-500 to-red-500 p-3.5 text-white shadow-[0_10px_24px_rgba(239,68,68,0.18)]">
            <p className="text-[13px] font-medium text-white/80">{labels.urgent}</p>
            <p className="mt-1.5 text-[2rem] font-semibold">{summary.urgentEvents}</p>
            <p className="mt-1 text-[12px] text-white/80">Urgentes o vencidos</p>
          </div>

          <div className="rounded-[20px] bg-gradient-to-r from-cyan-500 to-sky-500 p-3.5 text-white shadow-[0_10px_24px_rgba(14,165,233,0.16)]">
            <p className="text-[13px] font-medium text-white/80">{labels.upcoming}</p>
            <p className="mt-1.5 text-[2rem] font-semibold">{summary.upcomingEvents}</p>
            <p className="mt-1 text-[12px] text-white/80">Dentro de 48 horas</p>
          </div>
        </div>

       <div className="grid gap-3 xl:grid-cols-[1.65fr_1fr]">
  <div className="grid gap-3">
    <div className="rounded-[24px] border border-white/60 bg-white/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Agenda
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Mi agenda
          </h2>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-600">
          {loading ? "Cargando..." : `${myActiveActions.length} acciones`}
        </span>
      </div>

      <div className="space-y-3">
        {!loading && myActiveActions.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
            No hay acciones vigentes para mostrar.
          </div>
        ) : (
          myActiveActions.map((action) => renderActionCard(action, false))
        )}

        {!loading && myExpiredActions.length > 0 && (
          <details className="mt-4 overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50/80">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700">
              Vencidos ({myExpiredActions.length})
            </summary>

            <div className="space-y-3 border-t border-slate-200 p-3">
              {myExpiredActions.map((action) => renderActionCard(action, false))}
            </div>
          </details>
        )}
      </div>
    </div>

    <div className="rounded-[24px] border border-white/60 bg-white/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Equipo
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                Resto del equipo
              </h2>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-600">
              {loading ? "Cargando..." : `${teamActions.length} acciones`}
            </span>
          </div>

          <div className="space-y-3">
            {!loading && teamActions.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                No hay acciones del resto del equipo.
              </div>
            ) : (
              teamActions.map((action) => renderActionCard(action, true))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/60 bg-white/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Propiedades
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {labels.propertiesTitle}
          </h2>
        </div>

        <div className="space-y-3">
          {!loading && properties.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
              Sin propiedades asignadas.
            </div>
          ) : (
            properties.map((property) => (
              <div
                key={property.id}
                className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[16px] font-semibold text-slate-900">
                      {property.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {property.location || "Ubicación no definida"}
                    </p>
                  </div>

                  {property.operation && (
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                      {property.operation}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-[15px] font-semibold text-slate-900">
                  {property.price || "Precio no definido"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
          <div className="rounded-[24px] border border-white/60 bg-white/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Propiedades
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {labels.propertiesTitle}
              </h2>
            </div>

            <div className="space-y-3">
              {!loading && properties.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  Sin propiedades asignadas.
                </div>
              ) : (
                properties.map((property) => (
                  <div
                    key={property.id}
                    className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[16px] font-semibold text-slate-900">
                          {property.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {property.location || "Ubicación no definida"}
                        </p>
                      </div>

                      {property.operation && (
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                          {property.operation}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-[15px] font-semibold text-slate-900">
                      {property.price || "Precio no definido"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </>
    </AppShell>
  );
}