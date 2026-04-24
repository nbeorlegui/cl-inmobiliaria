"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import PropertyForm from "@/components/property-form";
import { APP_MENU } from "@/lib/app-menu";
import {
  createPropertyInSheets,
  deletePropertyInSheets,
  listPropertiesFromSheets,
  listUsersFromSheets,
  updatePropertyBoardStatusInSheets,
  updatePropertyInSheets,
  type PropertyBoardStatus,
  type PropertyItem,
} from "@/lib/calendar-api";
import { getCachedData, setCachedData } from "@/lib/view-cache";
import { clearSessionUser, getSessionUser, type SessionUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

type PropertiesCachePayload = {
  properties: PropertyItem[];
  users: SessionUser[];
};

const BOARD_COLUMNS: PropertyBoardStatus[] = [
  "Asignada",
  "Visita coordinada",
  "Visitada",
  "Finalizada",
];

type ToastState = {
  open: boolean;
  message: string;
  tone: "success" | "error";
};

function Toast({ open, message, tone }: ToastState) {
  if (!open) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[160]">
      <div
        className={`flex min-w-[260px] items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ${
          tone === "success"
            ? "border-emerald-100 bg-white text-slate-900"
            : "border-red-100 bg-white text-slate-900"
        }`}
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
            tone === "success"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {tone === "success" ? "✓" : "!"}
        </span>
        <div className="text-sm font-medium">{message}</div>
      </div>
    </div>
  );
}

function BoardModal({
  open,
  properties,
  onClose,
  onEdit,
  onChangeStatus,
}: {
  open: boolean;
  properties: PropertyItem[];
  onClose: () => void;
  onEdit: (property: PropertyItem) => void;
  onChangeStatus: (property: PropertyItem, nextStatus: PropertyBoardStatus) => void;
}) {
  const [draggedPropertyId, setDraggedPropertyId] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<PropertyBoardStatus | null>(null);

  const boardData = useMemo(() => {
    return BOARD_COLUMNS.reduce<Record<string, PropertyItem[]>>((acc, status) => {
      acc[status] = properties.filter(
        (property) => (property.estado_tablero || "Asignada") === status
      );
      return acc;
    }, {});
  }, [properties]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const draggedProperty =
    draggedPropertyId
      ? properties.find((property) => property.id === draggedPropertyId) || null
      : null;

  function handleDrop(status: PropertyBoardStatus) {
    if (!draggedProperty) return;
    setActiveColumn(null);
    setDraggedPropertyId(null);

    if ((draggedProperty.estado_tablero || "Asignada") === status) return;

    onChangeStatus(draggedProperty, status);
  }

  return (
    <div
      className="fixed inset-0 z-[150] bg-slate-950/45 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-3 md:p-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className="grid w-full max-w-7xl grid-rows-[auto,minmax(0,1fr)] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] max-h-[92dvh]"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 md:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Propiedades
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900 md:text-xl">
                Tablero
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Desktop: arrastrá tarjetas entre columnas. Mobile: seguí usando el selector.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            >
              ✕
            </button>
          </div>

          <div className="min-h-0 overflow-auto p-4 md:p-6">
            <div className="grid min-w-[1080px] gap-4 xl:grid-cols-4">
              {BOARD_COLUMNS.map((column) => {
                const isActiveDrop = activeColumn === column;

                return (
                  <div
                    key={column}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setActiveColumn(column);
                    }}
                    onDragLeave={() => {
                      if (activeColumn === column) setActiveColumn(null);
                    }}
                    onDrop={() => handleDrop(column)}
                    className={`rounded-[24px] border p-3.5 transition ${
                      isActiveDrop
                        ? "border-blue-300 bg-blue-50/70"
                        : "border-slate-200 bg-slate-50/70"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">{column}</h3>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {boardData[column]?.length || 0}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(boardData[column] || []).map((property) => (
                        <div
                          key={property.id}
                          draggable
                          onDragStart={() => {
                            setDraggedPropertyId(property.id);
                            setActiveColumn(null);
                          }}
                          onDragEnd={() => {
                            setDraggedPropertyId(null);
                            setActiveColumn(null);
                          }}
                          className={`rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm transition md:cursor-grab active:cursor-grabbing ${
                            draggedPropertyId === property.id ? "opacity-60" : ""
                          }`}
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            {property.codigo || "SIN CÓDIGO"}
                          </p>
                          <h4 className="mt-1 text-[15px] font-semibold text-slate-900">
                            {property.titulo_interno || "Sin título"}
                          </h4>
                          <p className="mt-1 text-[12px] text-slate-500">
                            {property.usuario_asignado_nombre || "Sin asignar"}
                          </p>
                          <p className="mt-2 text-[13px] text-slate-700">
                            {[property.ciudad, property.zona].filter(Boolean).join(" · ") || "Sin ubicación"}
                          </p>

                          {property.comentario_cierre && column === "Finalizada" && (
                            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-2.5 text-[12px] text-emerald-800">
                              {property.comentario_cierre}
                            </div>
                          )}

                          <div className="mt-3 hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500 md:block">
                            Arrastrá la tarjeta para cambiar de estado.
                          </div>

                          <div className="mt-3 flex flex-col gap-2">
                            <select
                              value={property.estado_tablero || "Asignada"}
                              onChange={(e) =>
                                onChangeStatus(property, e.target.value as PropertyBoardStatus)
                              }
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 outline-none md:hidden"
                            >
                              {BOARD_COLUMNS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => onEdit(property)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      ))}

                      {(boardData[column] || []).length === 0 && (
                        <div className="rounded-[20px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-[13px] text-slate-500">
                          Sin propiedades.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCacheKey(user: SessionUser) {
  return `properties:${user.id}:${user.rol}`;
}

function getBoardBadgeClasses(status: string) {
  switch (status) {
    case "Asignada":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "Visita coordinada":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "Visitada":
      return "border-amber-100 bg-amber-50 text-amber-700";
    case "Finalizada":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
    }
}

export default function PropiedadesPage() {
  const router = useRouter();

  const [session, setSession] = useState<SessionUser | null>(null);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    tone: "success",
  });

  function showToast(message: string, tone: "success" | "error" = "success") {
    setToast({ open: true, message, tone });
    window.setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 2200);
  }

  async function loadFromBackend(currentSession: SessionUser) {
    const [propertiesRes, usersRes] = await Promise.all([
      listPropertiesFromSheets(currentSession.id, currentSession.rol),
      listUsersFromSheets(),
    ]);

    const nextProperties = propertiesRes?.properties || [];
    const nextUsers = usersRes?.users || [];

    setProperties(nextProperties);
    setUsers(nextUsers);
    setCachedData<PropertiesCachePayload>(getCacheKey(currentSession), {
      properties: nextProperties,
      users: nextUsers,
    });
    setLoading(false);
  }

  useEffect(() => {
    const currentSession = getSessionUser();

    if (!currentSession) {
      router.replace("/login");
      return;
    }

    setSession(currentSession);

    const cached = getCachedData<PropertiesCachePayload>(getCacheKey(currentSession));
    if (cached) {
      setProperties(cached.properties || []);
      setUsers(cached.users || []);
      setLoading(false);
    }

    loadFromBackend(currentSession).catch(() => {
      setLoading(false);
      showToast("No se pudieron cargar las propiedades", "error");
    });
  }, [router]);

  const filteredProperties = useMemo(() => {
    const term = search.trim().toLowerCase();

    return properties.filter((property) => {
      if (!term) return true;

      return [
        property.codigo,
        property.titulo_interno,
        property.ciudad,
        property.zona,
        property.barrio,
        property.direccion,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [properties, search]);

  if (!session) return null;

  async function handleCreateProperty(payload: Partial<PropertyItem>) {
    if (!session) return;
    setSaving(true);

    const optimistic: PropertyItem = {
      id: `tmp_${crypto.randomUUID()}`,
      codigo: "Generando...",
      titulo_interno: payload.titulo_interno || "",
      tipo_propiedad: payload.tipo_propiedad || "",
      operacion: payload.operacion || "",
      estado_interno: payload.estado_interno || "",
      estado_publicacion: payload.estado_publicacion || "",
      publicar_web: payload.publicar_web || "",
      destacada: payload.destacada || "",
      slug: payload.slug || "",
      fecha_alta: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
      usuario_asignado_id: payload.usuario_asignado_id || "",
      usuario_asignado_nombre:
        users.find((u) => u.id === payload.usuario_asignado_id)?.nombre_apellido || "",
      propietario_id: payload.propietario_id || "",
      comentarios_internos: payload.comentarios_internos || "",
      pais: payload.pais || "",
      provincia: payload.provincia || "",
      ciudad: payload.ciudad || "",
      zona: payload.zona || "",
      barrio: payload.barrio || "",
      direccion: payload.direccion || "",
      precio: payload.precio || "",
      moneda: payload.moneda || "",
      observaciones_comerciales: payload.observaciones_comerciales || "",
      m2: payload.m2 || "",
      m2_cubiertos: payload.m2_cubiertos || "",
      ambientes: payload.ambientes || "",
      dormitorios: payload.dormitorios || "",
      banos: payload.banos || "",
      cochera: payload.cochera || "",
      titulo_publico: payload.titulo_publico || "",
      subtitulo_publico: payload.subtitulo_publico || "",
      descripcion_corta: payload.descripcion_corta || "",
      descripcion_larga: payload.descripcion_larga || "",
      estado_tablero: "Asignada",
      comentario_cierre: "",
      activo: true,
      updated_at: new Date().toISOString(),
      deleted_at: "",
    };

    const previous = properties;
    const next = [optimistic, ...previous];
    setProperties(next);
    setCachedData<PropertiesCachePayload>(getCacheKey(session), {
      properties: next,
      users,
    });

    setFormOpen(false);
    setSelectedProperty(null);
    showToast("Propiedad creada correctamente");

    try {
      const res = await createPropertyInSheets(payload);
      if (!res?.ok) throw new Error(res?.error || "No se pudo crear la propiedad");
      await loadFromBackend(session);
    } catch (error) {
      setProperties(previous);
      setCachedData<PropertiesCachePayload>(getCacheKey(session), {
        properties: previous,
        users,
      });
      showToast(
        error instanceof Error ? error.message : "No se pudo crear la propiedad",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateProperty(payload: Partial<PropertyItem>) {
    if (!session || !selectedProperty?.id) return;
    setSaving(true);

    const previous = properties;
    const next = previous.map((item) =>
      item.id === selectedProperty.id
        ? {
            ...item,
            ...payload,
            usuario_asignado_nombre:
              users.find((u) => u.id === payload.usuario_asignado_id)?.nombre_apellido ||
              item.usuario_asignado_nombre ||
              "",
            updated_at: new Date().toISOString(),
          }
        : item
    );

    setProperties(next);
    setCachedData<PropertiesCachePayload>(getCacheKey(session), {
      properties: next,
      users,
    });

    setFormOpen(false);
    setSelectedProperty(null);
    showToast("Propiedad actualizada correctamente");

    try {
      const res = await updatePropertyInSheets({
        id: selectedProperty.id,
        ...payload,
      });
      if (!res?.ok) throw new Error(res?.error || "No se pudo actualizar la propiedad");
      await loadFromBackend(session);
    } catch (error) {
      setProperties(previous);
      setCachedData<PropertiesCachePayload>(getCacheKey(session), {
        properties: previous,
        users,
      });
      showToast(
        error instanceof Error ? error.message : "No se pudo actualizar la propiedad",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProperty(id: string) {
    if (!session) return;

    const previous = properties;
    const next = previous.filter((item) => item.id !== id);
    setProperties(next);
    setCachedData<PropertiesCachePayload>(getCacheKey(session), {
      properties: next,
      users,
    });

    showToast("Propiedad eliminada correctamente");

    try {
      const res = await deletePropertyInSheets(id);
      if (!res?.ok) throw new Error(res?.error || "No se pudo eliminar la propiedad");
      await loadFromBackend(session);
    } catch (error) {
      setProperties(previous);
      setCachedData<PropertiesCachePayload>(getCacheKey(session), {
        properties: previous,
        users,
      });
      showToast(
        error instanceof Error ? error.message : "No se pudo eliminar la propiedad",
        "error"
      );
    }
  }

  async function handleChangeBoardStatus(
    property: PropertyItem,
    nextStatus: PropertyBoardStatus
  ) {
    if (!session) return;

    const comment =
      nextStatus === "Finalizada"
        ? window.prompt("Comentario de cierre", property.comentario_cierre || "") ?? ""
        : property.comentario_cierre || "";

    const previous = properties;
    const next = previous.map((item) =>
      item.id === property.id
        ? { ...item, estado_tablero: nextStatus, comentario_cierre: comment }
        : item
    );

    setProperties(next);
    setCachedData<PropertiesCachePayload>(getCacheKey(session), {
      properties: next,
      users,
    });

    try {
      const res = await updatePropertyBoardStatusInSheets({
        id: property.id,
        estado_tablero: nextStatus,
        comentario_cierre: comment,
      });
      if (!res?.ok) throw new Error(res?.error || "No se pudo actualizar el tablero");
      await loadFromBackend(session);
      showToast("Estado actualizado");
    } catch (error) {
      setProperties(previous);
      setCachedData<PropertiesCachePayload>(getCacheKey(session), {
        properties: previous,
        users,
      });
      showToast(
        error instanceof Error ? error.message : "No se pudo actualizar el tablero",
        "error"
      );
    }
  }

  function openCreate() {
    setFormMode("create");
    setSelectedProperty(null);
    setFormOpen(true);
  }

  function openEdit(property: PropertyItem) {
    setFormMode("edit");
    setSelectedProperty(property);
    setFormOpen(true);
  }

  function handleLogout() {
    clearSessionUser();
    router.replace("/login");
  }

  const totalProperties = properties.length;
  const totalAssigned = properties.filter((p) => p.usuario_asignado_id).length;
  const totalFinalizadas = properties.filter((p) => p.estado_tablero === "Finalizada").length;
  const totalCoordinadas = properties.filter((p) => p.estado_tablero === "Visita coordinada").length;

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
                Propiedades
              </h1>
              <p className="mt-1 max-w-2xl text-[13px] text-slate-500">
                {session.rol === "admin"
                  ? "Gestión general de propiedades del equipo."
                  : "Visualización de propiedades asignadas a tu usuario."}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setBoardOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Tablero
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_12px_26px_rgba(59,130,246,0.22)] transition hover:scale-[1.01]"
              >
                + Nueva propiedad
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 md:hidden"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        <div className="mb-3 hidden gap-2.5 md:grid md:grid-cols-4">
          <KpiCard title="Total" value={totalProperties} subtitle="Propiedades activas" tone="blue" />
          <KpiCard title="Asignadas" value={totalAssigned} subtitle="Con usuario asignado" tone="violet" />
          <KpiCard title="Visitas coordinadas" value={totalCoordinadas} subtitle="En seguimiento" tone="cyan" />
          <KpiCard title="Finalizadas" value={totalFinalizadas} subtitle="Cerradas en tablero" tone="emerald" />
        </div>

        <div className="mb-3 rounded-[24px] border border-white/60 bg-white/90 p-3.5 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, título, ciudad, zona, barrio o dirección..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="rounded-[24px] border border-white/60 bg-white/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {property.codigo || "SIN CÓDIGO"}
                  </p>
                  <h3 className="mt-1 text-[18px] font-semibold leading-tight text-slate-900">
                    {property.titulo_interno || "Sin título"}
                  </h3>
                </div>

                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getBoardBadgeClasses(
                    property.estado_tablero || "Asignada"
                  )}`}
                >
                  {property.estado_tablero || "Asignada"}
                </span>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {property.operacion && (
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {property.operacion}
                  </span>
                )}
                {property.tipo_propiedad && (
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {property.tipo_propiedad}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-[13px] text-slate-600">
                <p>{[property.ciudad, property.zona, property.barrio].filter(Boolean).join(" · ") || "Sin ubicación"}</p>
                <p className="text-[18px] font-semibold text-slate-900">
                  {property.moneda ? `${property.moneda} ${property.precio || "-"}` : property.precio || "-"}
                </p>
                <p className="text-[12px] text-slate-500">
                  Asignada a: {property.usuario_asignado_nombre || "Sin asignar"}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                <MiniStat label="Amb." value={property.ambientes || "-"} />
                <MiniStat label="Dorm." value={property.dormitorios || "-"} />
                <MiniStat label="Baños" value={property.banos || "-"} />
                <MiniStat label="m²" value={property.m2 || "-"} />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(property)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteProperty(property.id)}
                  className="flex-1 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && filteredProperties.length === 0 && (
          <div className="mt-3 rounded-[24px] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-[13px] text-slate-500">
            No se encontraron propiedades con esos filtros.
          </div>
        )}

        <PropertyForm
          open={formOpen}
          mode={formMode}
          users={users}
          initialData={selectedProperty}
          saving={saving}
          onClose={() => {
            setFormOpen(false);
            setSelectedProperty(null);
          }}
          onSubmit={(payload) =>
            formMode === "create"
              ? handleCreateProperty(payload)
              : handleUpdateProperty(payload)
          }
        />

        <BoardModal
          open={boardOpen}
          properties={properties}
          onClose={() => setBoardOpen(false)}
          onEdit={(property) => {
            setBoardOpen(false);
            openEdit(property);
          }}
          onChangeStatus={handleChangeBoardStatus}
        />
      </>
    </AppShell>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: number;
  subtitle: string;
  tone: "blue" | "violet" | "cyan" | "emerald";
}) {
  const tones = {
    blue: "from-blue-600 to-blue-500 shadow-[0_10px_24px_rgba(37,99,235,0.16)]",
    violet: "from-violet-600 to-fuchsia-500 shadow-[0_10px_24px_rgba(139,92,246,0.18)]",
    cyan: "from-cyan-500 to-sky-500 shadow-[0_10px_24px_rgba(14,165,233,0.16)]",
    emerald: "from-emerald-500 to-teal-500 shadow-[0_10px_24px_rgba(16,185,129,0.16)]",
  };

  return (
    <div className={`rounded-[20px] bg-gradient-to-r p-3.5 text-white ${tones[tone]}`}>
      <p className="text-[13px] font-medium text-white/80">{title}</p>
      <p className="mt-1.5 text-[2rem] font-semibold">{value}</p>
      <p className="mt-1 text-[12px] text-white/80">{subtitle}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-slate-900">{value}</p>
    </div>
  );
}
