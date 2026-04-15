type PropertyCardItem = {
  code: string;
  title: string;
  op: "Venta" | "Alquiler" | "Temporal";
  price: string;
  zone: string;
  city: string;
  status: string;
  publishStatus: string;
  surface: string;
  rooms: string;
  image: string;
};

type PropertiesGridProps = {
  properties: PropertyCardItem[];
};

export default function PropertiesGrid({ properties }: PropertiesGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {properties.map((property) => (
        <div
          key={property.code}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="relative h-48 w-full overflow-hidden bg-slate-100">
            <img
              src={property.image}
              alt={property.title}
              className="h-full w-full object-cover"
            />

            <div className="absolute left-3 top-3 flex gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  property.op === "Venta"
                    ? "bg-blue-50 text-blue-600"
                    : property.op === "Alquiler"
                    ? "bg-violet-50 text-violet-600"
                    : "bg-fuchsia-50 text-fuchsia-600"
                }`}
              >
                {property.op}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  property.publishStatus === "Publicada"
                    ? "bg-emerald-50 text-emerald-600"
                    : property.publishStatus === "Borrador"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {property.publishStatus}
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="text-lg font-semibold tracking-tight text-slate-900">
                {property.price}
              </div>
              <div className="text-xs font-medium text-slate-400">
                {property.code}
              </div>
            </div>

            <div className="mt-3 text-sm font-semibold text-slate-900">
              {property.title}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {property.zone}, {property.city}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                {property.surface}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                {property.rooms}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-600">
                {property.status}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Ver
              </button>
              <button className="flex-1 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Editar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}