import PageShell from "@/components/layout/page-shell";

export default function InversoresPage() {
  return (
    <PageShell
      title="Inversores"
      description="Seguimiento de inversores y búsquedas permanentes."
    >
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-medium">Módulo de inversores</div>
        <p className="mt-2 text-sm text-neutral-600">
          Acá vamos a mostrar perfiles, rangos, zonas de interés y oportunidades.
        </p>
      </div>
    </PageShell>
  );
}