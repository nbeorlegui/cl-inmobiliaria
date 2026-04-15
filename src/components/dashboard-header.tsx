export default function DashboardHeader() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between px-5 py-5 md:px-8">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
            Dashboard
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Sistema comercial inmobiliario
          </h1>

          <p className="mt-2 max-w-3xl text-sm text-slate-500 md:text-base">
            Base clara tipo SaaS, KPIs intensos, layout aireado y módulo de
            propiedades con look de producto real.
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
            Buscar propiedades, contactos o acciones...
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-semibold text-white">
            NB
          </div>
        </div>
      </div>
    </section>
  );
}