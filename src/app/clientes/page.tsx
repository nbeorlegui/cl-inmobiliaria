import PageShell from "@/components/layout/page-shell";

export default function ClientesPage() {
  return (
    <PageShell
      title="Clientes"
      description="Clientes actuales de la inmobiliaria y relaciones activas."
    >
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-medium">Módulo de clientes</div>
        <p className="mt-2 text-sm text-neutral-600">
          Acá vamos a mostrar compradores, inquilinos, propietarios y clientes administrados.
        </p>
      </div>
    </PageShell>
  );
}