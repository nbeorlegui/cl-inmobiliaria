import Link from "next/link";
import type { SessionUser } from "@/types";
import LogoutButton from "@/components/logout-button";

type DashboardHomeProps = {
  user: SessionUser;
};

export default function DashboardHome({ user }: DashboardHomeProps) {
  const stats = [
    {
      label: user.rol === "admin" ? "Propiedades activas" : "Propiedades asignadas",
      value: user.rol === "admin" ? "128" : "24",
      tone: "from-blue-600 to-blue-500",
      detail: user.rol === "admin" ? "12 nuevas este mes" : "4 nuevas esta semana",
    },
    {
      label: "Visitas de hoy",
      value: user.rol === "admin" ? "14" : "5",
      tone: "from-violet-600 to-violet-500",
      detail: user.rol === "admin" ? "4 de prioridad alta" : "2 confirmadas",
    },
    {
      label: user.rol === "admin" ? "Contactos nuevos" : "Mis contactos",
      value: user.rol === "admin" ? "23" : "9",
      tone: "from-cyan-500 to-sky-500",
      detail:
        user.rol === "admin"
          ? "Ingresados por WhatsApp y Meta"
          : "Asignados a tu cartera",
    },
    {
      label: "Tareas pendientes",
      value: user.rol === "admin" ? "8" : "3",
      tone: "from-fuchsia-600 to-purple-500",
      detail: "Seguimientos para hoy",
    },
  ];

  const visits = [
    {
      time: "09:00",
      client: "María Gómez",
      property: "Depto. Palmares",
      agent: "Lucía Pérez",
      type: "Visita",
      urgency: "Alta",
    },
    {
      time: "10:30",
      client: "Carlos Ruiz",
      property: "Casa Chacras",
      agent: "Tomás Díaz",
      type: "Llamada",
      urgency: "Media",
    },
    {
      time: "16:30",
      client: "Valentina Sosa",
      property: "Local Centro",
      agent: "Bruno Gil",
      type: "Visita",
      urgency: "Alta",
    },
  ];

  const properties = [
    {
      code: "CL-104",
      title: "Casa en Chacras de Coria",
      op: "Venta",
      price: "USD 185.000",
      zone: "Luján de Cuyo",
      status: "Disponible",
      surface: "240 m²",
      rooms: "4 amb.",
      image:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    },
    {
      code: "CL-088",
      title: "Departamento en Ciudad",
      op: "Alquiler",
      price: "$ 680.000",
      zone: "Mendoza Centro",
      status: "Reservada",
      surface: "98 m²",
      rooms: "3 amb.",
      image:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    },
    {
      code: "CL-131",
      title: "Local comercial",
      op: "Alquiler",
      price: "$ 1.200.000",
      zone: "Godoy Cruz",
      status: "Disponible",
      surface: "180 m²",
      rooms: "Local",
      image:
        "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const menu =
    user.rol === "admin"
      ? [
          { label: "Dashboard", href: "/" },
          { label: "Propiedades", href: "/propiedades" },
          { label: "Contactos", href: "/contactos" },
          { label: "Acciones", href: "/acciones" },
          { label: "Calendario", href: "/calendario" },
          { label: "Clientes", href: "/clientes" },
          { label: "Inversores", href: "/inversores" },
          { label: "Vendedores", href: "/vendedores" },
        ]
      : [
          { label: "Dashboard", href: "/" },
          { label: "Propiedades", href: "/propiedades" },
          { label: "Contactos", href: "/contactos" },
          { label: "Acciones", href: "/acciones" },
          { label: "Calendario", href: "/calendario" },
          { label: "Clientes", href: "/clientes" },
        ];

  const getUrgencyClasses = (urgency: string) => {
    if (urgency === "Alta") return "border-l-red-500 bg-red-50";
    if (urgency === "Media") return "border-l-amber-400 bg-amber-50";
    return "border-l-emerald-500 bg-emerald-50";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-72 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-bold text-white">
                CL
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight text-slate-900">
                  CL Inmobiliaria
                </div>
                <div className="text-xs text-slate-500">
                  {user.rol === "admin" ? "Administrador" : "Vendedor"}
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            {menu.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                  index === 0
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-100"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">
                {user.nombre}
              </div>
              <div className="mt-1 text-xs leading-5 text-slate-500">
                {user.email}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <section className="border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between px-5 py-5 md:px-8">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                  Dashboard
                </div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                  Bienvenida, {user.nombre}
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-500 md:text-base">
                  {user.rol === "admin"
                    ? "Vista administrativa completa del sistema."
                    : "Vista personal con acceso solo a tus módulos asignados."}
                </p>
              </div>

             <LogoutButton />
            </div>
          </section>

          <section className="px-5 py-5 md:px-8 md:py-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`overflow-hidden rounded-3xl bg-gradient-to-br ${stat.tone} p-5 text-white shadow-lg shadow-slate-200`}
                >
                  <div className="text-sm font-medium text-white/80">
                    {stat.label}
                  </div>
                  <div className="mt-3 text-4xl font-semibold tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-3 text-xs text-white/80">
                    {stat.detail}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Acciones del día
                    </h2>
                    <p className="text-sm text-slate-500">
                      {user.rol === "admin"
                        ? "Eventos generales del equipo"
                        : "Tus acciones asignadas"}
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

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Accesos rápidos
                    </h2>
                    <p className="text-sm text-slate-500">
                      Módulos principales del sistema
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {menu.slice(1, 6).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white hover:shadow-sm"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Propiedades destacadas
                  </h2>
                  <p className="text-sm text-slate-500">
                    Visualización rápida del portfolio inmobiliario.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <div
                    key={property.code}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
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
                      <div className="mt-1 text-xs text-slate-500">
                        {property.zone}
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {property.surface}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {property.rooms}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-600">
                          {property.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}