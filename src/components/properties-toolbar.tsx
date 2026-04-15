import Link from "next/link";

type PropertiesToolbarProps = {
  searchPlaceholder?: string;
};

export default function PropertiesToolbar({
  searchPlaceholder = "Buscar por código, título o zona...",
}: PropertiesToolbarProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))_auto]">
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
        />

        <select className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-blue-500">
          <option>Todas las operaciones</option>
          <option>Venta</option>
          <option>Alquiler</option>
          <option>Temporal</option>
        </select>

        <select className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-blue-500">
          <option>Todos los estados</option>
          <option>Disponible</option>
          <option>Reservada</option>
          <option>Vendida</option>
          <option>Alquilada</option>
          <option>Pausada</option>
        </select>

        <select className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-blue-500">
          <option>Publicación web</option>
          <option>Publicada</option>
          <option>No publicada</option>
          <option>Borrador</option>
        </select>

        <select className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-blue-500">
          <option>Todas las ciudades</option>
          <option>Mendoza</option>
          <option>Luján de Cuyo</option>
          <option>Godoy Cruz</option>
          <option>Maipú</option>
        </select>

        <Link
          href="/propiedades/nueva"
          className="flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:opacity-95"
        >
          Nueva propiedad
        </Link>
      </div>
    </div>
  );
}