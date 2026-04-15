import type { PropertyItem } from "@/types";

type PropertiesTableProps = {
  properties: PropertyItem[];
};

export default function PropertiesTable({
  properties,
}: PropertiesTableProps) {
  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Propiedades destacadas
          </h2>
          <p className="text-sm text-slate-500">
            Tarjetas visuales con imagen, precio y datos clave.
          </p>
        </div>

        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-600">
            Venta
          </span>
          <span className="rounded-full bg-violet-50 px-3 py-1 font-medium text-violet-600">
            Alquiler
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
            Grid view
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {properties.map((property) => (
          <div
            key={property.code}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="h-44 w-full overflow-hidden bg-slate-100">
              {property.image ? (
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-semibold tracking-tight text-slate-900">
                  {property.price}
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    property.op === "Venta"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {property.op}
                </span>
              </div>

              <div className="mt-3 text-sm font-medium text-slate-900">
                {property.title}
              </div>
              <div className="mt-1 text-xs text-slate-500">{property.zone}</div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                {property.surface ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    {property.surface}
                  </span>
                ) : null}

                {property.rooms ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    {property.rooms}
                  </span>
                ) : null}

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-600">
                  {property.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}