"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { APP_MENU } from "@/lib/app-menu";

type PropertyOperation = "venta" | "alquiler";
type PropertyType =
  | "casa"
  | "depto"
  | "lote"
  | "local"
  | "duplex"
  | "oficina";

type PropertyStatus = "disponible" | "reservada" | "vendida" | "alquilada";

type PropertyItem = {
  id: string;
  code: string;
  title: string;
  type: PropertyType;
  operation: PropertyOperation;
  status: PropertyStatus;
  location: string;
  price: string;
  bedrooms?: number;
  bathrooms?: number;
  areaM2: number;
  featured?: boolean;
};

const MOCK_PROPERTIES: PropertyItem[] = [
  {
    id: "prop-001",
    code: "CL-001",
    title: "Casa moderna en Chacras de Coria",
    type: "casa",
    operation: "venta",
    status: "disponible",
    location: "Chacras de Coria, Mendoza",
    price: "USD 235.000",
    bedrooms: 3,
    bathrooms: 2,
    areaM2: 180,
    featured: true,
  },
  {
    id: "prop-002",
    code: "CL-002",
    title: "Departamento céntrico de 2 dormitorios",
    type: "depto",
    operation: "alquiler",
    status: "disponible",
    location: "Ciudad de Mendoza",
    price: "ARS 680.000",
    bedrooms: 2,
    bathrooms: 1,
    areaM2: 74,
  },
  {
    id: "prop-003",
    code: "CL-003",
    title: "Lote en barrio privado",
    type: "lote",
    operation: "venta",
    status: "reservada",
    location: "Maipú, Mendoza",
    price: "USD 48.000",
    areaM2: 520,
    featured: true,
  },
  {
    id: "prop-004",
    code: "CL-004",
    title: "Local comercial sobre avenida",
    type: "local",
    operation: "alquiler",
    status: "disponible",
    location: "Godoy Cruz, Mendoza",
    price: "ARS 1.250.000",
    bathrooms: 1,
    areaM2: 95,
  },
  {
    id: "prop-005",
    code: "CL-005",
    title: "Dúplex con patio y cochera",
    type: "duplex",
    operation: "venta",
    status: "disponible",
    location: "Luján de Cuyo, Mendoza",
    price: "USD 128.000",
    bedrooms: 2,
    bathrooms: 2,
    areaM2: 112,
  },
  {
    id: "prop-006",
    code: "CL-006",
    title: "Oficina en edificio corporativo",
    type: "oficina",
    operation: "alquiler",
    status: "alquilada",
    location: "Ciudad de Mendoza",
    price: "ARS 890.000",
    bathrooms: 1,
    areaM2: 68,
  },
  {
    id: "prop-007",
    code: "CL-007",
    title: "Casa familiar con jardín",
    type: "casa",
    operation: "venta",
    status: "vendida",
    location: "Guaymallén, Mendoza",
    price: "USD 198.000",
    bedrooms: 3,
    bathrooms: 2,
    areaM2: 165,
  },
  {
    id: "prop-008",
    code: "CL-008",
    title: "Departamento monoambiente premium",
    type: "depto",
    operation: "alquiler",
    status: "disponible",
    location: "Godoy Cruz, Mendoza",
    price: "ARS 520.000",
    bathrooms: 1,
    areaM2: 39,
  },
];

function propertyTypeLabel(type: PropertyType) {
  switch (type) {
    case "casa":
      return "Casa";
    case "depto":
      return "Depto";
    case "lote":
      return "Lote";
    case "local":
      return "Local";
    case "duplex":
      return "Dúplex";
    case "oficina":
      return "Oficina";
    default:
      return type;
  }
}

function operationLabel(operation: PropertyOperation) {
  return operation === "venta" ? "Venta" : "Alquiler";
}

function getStatusClasses(status: PropertyStatus) {
  switch (status) {
    case "disponible":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    case "reservada":
      return "border-amber-100 bg-amber-50 text-amber-700";
    case "vendida":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "alquilada":
      return "border-violet-100 bg-violet-50 text-violet-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getOperationClasses(operation: PropertyOperation) {
  return operation === "venta"
    ? "border-blue-100 bg-blue-50 text-blue-700"
    : "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700";
}

export default function PropiedadesPage() {
  const [search, setSearch] = useState("");
  const [operationFilter, setOperationFilter] = useState<"todas" | PropertyOperation>("todas");
  const [typeFilter, setTypeFilter] = useState<"todos" | PropertyType>("todos");

  const filteredProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(search.toLowerCase()) ||
        property.location.toLowerCase().includes(search.toLowerCase()) ||
        property.code.toLowerCase().includes(search.toLowerCase());

      const matchesOperation =
        operationFilter === "todas" || property.operation === operationFilter;

      const matchesType = typeFilter === "todos" || property.type === typeFilter;

      return matchesSearch && matchesOperation && matchesType;
    });
  }, [search, operationFilter, typeFilter]);

  const totalProperties = MOCK_PROPERTIES.length;
  const totalForSale = MOCK_PROPERTIES.filter((p) => p.operation === "venta").length;
  const totalForRent = MOCK_PROPERTIES.filter((p) => p.operation === "alquiler").length;
  const totalAvailable = MOCK_PROPERTIES.filter((p) => p.status === "disponible").length;

  return (
    <AppShell menu={APP_MENU}>
      <>
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
                Gestión general de inmuebles para venta y alquiler.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_12px_26px_rgba(59,130,246,0.22)] transition hover:scale-[1.01]"
            >
              + Nueva propiedad
            </button>
          </div>
        </div>

        <div className="mb-3 grid gap-2.5 md:grid-cols-4">
          <div className="rounded-[20px] bg-gradient-to-r from-blue-600 to-blue-500 p-3.5 text-white shadow-[0_10px_24px_rgba(37,99,235,0.16)]">
            <p className="text-[13px] font-medium text-white/80">Total</p>
            <p className="mt-1.5 text-[2rem] font-semibold">{totalProperties}</p>
            <p className="mt-1 text-[12px] text-white/80">Propiedades cargadas</p>
          </div>

          <div className="rounded-[20px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-3.5 text-white shadow-[0_10px_24px_rgba(139,92,246,0.18)]">
            <p className="text-[13px] font-medium text-white/80">En venta</p>
            <p className="mt-1.5 text-[2rem] font-semibold">{totalForSale}</p>
            <p className="mt-1 text-[12px] text-white/80">Operaciones de venta</p>
          </div>

          <div className="rounded-[20px] bg-gradient-to-r from-cyan-500 to-sky-500 p-3.5 text-white shadow-[0_10px_24px_rgba(14,165,233,0.16)]">
            <p className="text-[13px] font-medium text-white/80">En alquiler</p>
            <p className="mt-1.5 text-[2rem] font-semibold">{totalForRent}</p>
            <p className="mt-1 text-[12px] text-white/80">Operaciones de alquiler</p>
          </div>

          <div className="rounded-[20px] bg-gradient-to-r from-emerald-500 to-teal-500 p-3.5 text-white shadow-[0_10px_24px_rgba(16,185,129,0.16)]">
            <p className="text-[13px] font-medium text-white/80">Disponibles</p>
            <p className="mt-1.5 text-[2rem] font-semibold">{totalAvailable}</p>
            <p className="mt-1 text-[12px] text-white/80">Publicables o activas</p>
          </div>
        </div>

        <div className="mb-3 rounded-[24px] border border-white/60 bg-white/90 p-3.5 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="grid gap-2 md:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, ubicación o código..."
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />

            <select
              value={operationFilter}
              onChange={(e) =>
                setOperationFilter(e.target.value as "todas" | PropertyOperation)
              }
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            >
              <option value="todas">Todas las operaciones</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "todos" | PropertyType)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            >
              <option value="todos">Todos los tipos</option>
              <option value="casa">Casa</option>
              <option value="depto">Depto</option>
              <option value="lote">Lote</option>
              <option value="local">Local</option>
              <option value="duplex">Dúplex</option>
              <option value="oficina">Oficina</option>
            </select>
          </div>
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
                    {property.code}
                  </p>
                  <h3 className="mt-1 text-[18px] font-semibold leading-tight text-slate-900">
                    {property.title}
                  </h3>
                </div>

                {property.featured && (
                  <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    Destacada
                  </span>
                )}
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getOperationClasses(
                    property.operation
                  )}`}
                >
                  {operationLabel(property.operation)}
                </span>

                <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                  {propertyTypeLabel(property.type)}
                </span>

                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusClasses(
                    property.status
                  )}`}
                >
                  {property.status}
                </span>
              </div>

              <div className="space-y-1.5 text-[13px] text-slate-600">
                <p>{property.location}</p>
                <p className="text-[18px] font-semibold text-slate-900">{property.price}</p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                    Dorm.
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-900">
                    {property.bedrooms ?? "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                    Baños
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-900">
                    {property.bathrooms ?? "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                    m²
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-900">
                    {property.areaM2}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Ver
                </button>

                <button
                  type="button"
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(59,130,246,0.18)] transition hover:scale-[1.01]"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="mt-3 rounded-[24px] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-[13px] text-slate-500">
            No se encontraron propiedades con esos filtros.
          </div>
        )}
      </>
    </AppShell>
  );
}