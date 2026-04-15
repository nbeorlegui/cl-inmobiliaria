import PageShell from "@/components/layout/page-shell";

export default function AccionesPage() {
  return (
    <PageShell
      title="Acciones"
      description="Visitas, llamadas, seguimientos y tareas comerciales."
    >
      <div className="rounded-2xl border border-[#E7DED2] bg-[#FFFDF9] p-6 shadow-sm">
        <div className="text-lg font-medium text-[#1F1F1F]">
          Módulo de acciones
        </div>
        <p className="mt-2 text-sm leading-7 text-[#6B6258]">
          Acá vamos a mostrar agenda operativa, prioridades, estados y
          asignaciones.
        </p>
      </div>
    </PageShell>
  );
}