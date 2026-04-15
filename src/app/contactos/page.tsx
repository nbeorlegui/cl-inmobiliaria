"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { APP_MENU } from "@/lib/app-menu";
import { clearSessionUser, getSessionUser, type SessionUser } from "@/lib/auth";

type ContactLead = {
  id: string;
  fecha_ingreso: string;
  canal_origen: string;
  nombre_apellido: string;
  telefono: string;
  email: string;
  interes: string;
  propiedad_interes: string;
  zona_interes: string;
  presupuesto: string;
  estado_contacto: string;
  usuario_asignado_id: string;
  comentarios: string;
  activo: boolean;
  updated_at: string;
  deleted_at: string;
};

type LeadForm = {
  fecha_ingreso: string;
  canal_origen: string;
  nombre_apellido: string;
  telefono: string;
  email: string;
  interes: string;
  propiedad_interes: string;
  zona_interes: string;
  presupuesto: string;
  estado_contacto: string;
  usuario_asignado_id: string;
  comentarios: string;
};

const SUPERADMIN_USERNAME = "nicolas";

const EMPTY_FORM: LeadForm = {
  fecha_ingreso: "",
  canal_origen: "WhatsApp",
  nombre_apellido: "",
  telefono: "",
  email: "",
  interes: "",
  propiedad_interes: "",
  zona_interes: "",
  presupuesto: "",
  estado_contacto: "nuevo",
  usuario_asignado_id: "",
  comentarios: "",
};

const MOCK_CONTACTS: ContactLead[] = [];

export default function ContactosPage() {
  const router = useRouter();

  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<ContactLead[]>(MOCK_CONTACTS);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<LeadForm>(EMPTY_FORM);

  useEffect(() => {
    const currentSession = getSessionUser();

    if (!currentSession) {
      router.replace("/login");
      return;
    }

    setSession(currentSession);
    setLoading(false);
  }, [router]);

  const isSuperadmin =
  (session?.usuario || "").trim().toLowerCase() === SUPERADMIN_USERNAME;

  const filteredContacts = useMemo(() => {
    const term = search.toLowerCase();

    return contacts.filter((contact) => {
      return (
        contact.nombre_apellido.toLowerCase().includes(term) ||
        contact.telefono.toLowerCase().includes(term) ||
        contact.email.toLowerCase().includes(term) ||
        contact.canal_origen.toLowerCase().includes(term)
      );
    });
  }, [contacts, search]);

  function handleLogout() {
    clearSessionUser();
    router.replace("/login");
  }

  function handleCreateLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newLead: ContactLead = {
      id: `lead_mock_${crypto.randomUUID()}`,
      fecha_ingreso: form.fecha_ingreso,
      canal_origen: form.canal_origen,
      nombre_apellido: form.nombre_apellido,
      telefono: form.telefono,
      email: form.email,
      interes: form.interes,
      propiedad_interes: form.propiedad_interes,
      zona_interes: form.zona_interes,
      presupuesto: form.presupuesto,
      estado_contacto: form.estado_contacto,
      usuario_asignado_id: form.usuario_asignado_id,
      comentarios: form.comentarios,
      activo: true,
      updated_at: "",
      deleted_at: "",
    };

    setContacts((prev) => [newLead, ...prev]);
    setModalOpen(false);
    setForm(EMPTY_FORM);
  }

  if (loading) {
    return (
      <AppShell menu={APP_MENU}>
        <div className="rounded-[24px] border border-white/60 bg-white/90 p-8 text-center text-sm text-slate-500 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          Cargando módulo...
        </div>
      </AppShell>
    );
  }

  if (!session) return null;

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
                Contactos
              </h1>
              <p className="mt-1 max-w-2xl text-[13px] text-slate-500">
                Base de leads y contactos comerciales del sistema.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-700">
                {session.nombre_apellido} · {session.rol === "admin" ? "Admin" : "Vendedor"}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {!isSuperadmin ? (
          <div className="rounded-[24px] border border-red-100 bg-white/90 p-8 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="rounded-[20px] border border-red-100 bg-red-50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-400">
                Módulo en preparación
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                Este módulo todavía no está liberado
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Por ahora solo puede verlo el superadmin hasta cerrar la integración real con Sheets.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3 grid gap-2.5 md:grid-cols-3">
              <div className="rounded-[20px] bg-gradient-to-r from-blue-600 to-blue-500 p-3.5 text-white shadow-[0_10px_24px_rgba(37,99,235,0.16)]">
                <p className="text-[13px] font-medium text-white/80">Leads</p>
                <p className="mt-1.5 text-[2rem] font-semibold">{contacts.length}</p>
                <p className="mt-1 text-[12px] text-white/80">Carga mock inicial</p>
              </div>

              <div className="rounded-[20px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-3.5 text-white shadow-[0_10px_24px_rgba(139,92,246,0.18)]">
                <p className="text-[13px] font-medium text-white/80">Canales</p>
                <p className="mt-1.5 text-[2rem] font-semibold">4</p>
                <p className="mt-1 text-[12px] text-white/80">WhatsApp, Web, Meta, Otros</p>
              </div>

              <div className="rounded-[20px] bg-gradient-to-r from-cyan-500 to-sky-500 p-3.5 text-white shadow-[0_10px_24px_rgba(14,165,233,0.16)]">
                <p className="text-[13px] font-medium text-white/80">Estado</p>
                <p className="mt-1.5 text-[2rem] font-semibold">Pendiente</p>
                <p className="mt-1 text-[12px] text-white/80">Próxima integración real</p>
              </div>
            </div>

            <div className="mb-3 rounded-[24px] border border-white/60 bg-white/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, teléfono, email o canal..."
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_12px_26px_rgba(59,130,246,0.22)] transition hover:scale-[1.01]"
                >
                  + Nuevo lead
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/60 bg-white/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Listado
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  Leads cargados
                </h2>
              </div>

              <div className="overflow-hidden rounded-[18px] border border-slate-200">
                <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  <div className="col-span-3">Nombre</div>
                  <div className="col-span-2">Canal</div>
                  <div className="col-span-2">Teléfono</div>
                  <div className="col-span-2">Estado</div>
                  <div className="col-span-3">Interés</div>
                </div>

                {filteredContacts.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[13px] text-slate-500">
                    Todavía no hay leads cargados.
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="grid grid-cols-12 gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0"
                    >
                      <div className="col-span-3">
                        <p className="text-[13px] font-semibold text-slate-900">
                          {contact.nombre_apellido}
                        </p>
                        <p className="text-[11px] text-slate-500">{contact.email || "Sin mail"}</p>
                      </div>

                      <div className="col-span-2 text-[13px] text-slate-700">
                        {contact.canal_origen}
                      </div>

                      <div className="col-span-2 text-[13px] text-slate-700">
                        {contact.telefono}
                      </div>

                      <div className="col-span-2 text-[13px] text-slate-700">
                        {contact.estado_contacto}
                      </div>

                      <div className="col-span-3 text-[13px] text-slate-700">
                        {contact.interes || "Sin definir"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {modalOpen && isSuperadmin && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-[2px]">
            <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
              <div className="border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-blue-50 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      CL Inmobiliaria
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                      Nuevo lead
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateLead} className="px-6 py-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Fecha ingreso
                    </label>
                    <input
                      type="date"
                      value={form.fecha_ingreso}
                      onChange={(e) => setForm((prev) => ({ ...prev, fecha_ingreso: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Canal origen
                    </label>
                    <select
                      value={form.canal_origen}
                      onChange={(e) => setForm((prev) => ({ ...prev, canal_origen: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Web">Web</option>
                      <option value="Meta">Meta</option>
                      <option value="Llamada">Llamada</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nombre y apellido
                    </label>
                    <input
                      value={form.nombre_apellido}
                      onChange={(e) => setForm((prev) => ({ ...prev, nombre_apellido: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Teléfono
                    </label>
                    <input
                      value={form.telefono}
                      onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Interés
                    </label>
                    <input
                      value={form.interes}
                      onChange={(e) => setForm((prev) => ({ ...prev, interes: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      placeholder="Casa, depto, lote..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Propiedad interés
                    </label>
                    <input
                      value={form.propiedad_interes}
                      onChange={(e) => setForm((prev) => ({ ...prev, propiedad_interes: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Zona interés
                    </label>
                    <input
                      value={form.zona_interes}
                      onChange={(e) => setForm((prev) => ({ ...prev, zona_interes: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Presupuesto
                    </label>
                    <input
                      value={form.presupuesto}
                      onChange={(e) => setForm((prev) => ({ ...prev, presupuesto: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Estado contacto
                    </label>
                    <select
                      value={form.estado_contacto}
                      onChange={(e) => setForm((prev) => ({ ...prev, estado_contacto: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="en_gestion">En gestión</option>
                      <option value="contactado">Contactado</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Comentarios
                    </label>
                    <textarea
                      rows={4}
                      value={form.comentarios}
                      onChange={(e) => setForm((prev) => ({ ...prev, comentarios: e.target.value }))}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(59,130,246,0.28)] transition hover:scale-[1.01]"
                  >
                    Guardar lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    </AppShell>
  );
}