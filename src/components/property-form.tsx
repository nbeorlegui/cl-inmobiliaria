"use client";

import { useEffect, useState } from "react";
import type { PropertyItem } from "@/lib/calendar-api";
import type { SessionUser } from "@/lib/auth";

type PropertyFormProps = {
  open: boolean;
  mode: "create" | "edit";
  users: SessionUser[];
  initialData?: PropertyItem | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<PropertyItem>) => Promise<void> | void;
};

type FormState = {
  titulo_interno: string;
  tipo_propiedad: string;
  operacion: string;
  estado_interno: string;
  estado_publicacion: string;
  publicar_web: string;
  destacada: string;
  usuario_asignado_id: string;
  comentarios_internos: string;
  pais: string;
  provincia: string;
  ciudad: string;
  zona: string;
  barrio: string;
  direccion: string;
  precio: string;
  moneda: string;
  observaciones_comerciales: string;
  m2: string;
  m2_cubiertos: string;
  ambientes: string;
  dormitorios: string;
  banos: string;
  cochera: string;
  titulo_publico: string;
  subtitulo_publico: string;
  descripcion_corta: string;
  descripcion_larga: string;
  estado_tablero: string;
  comentario_cierre: string;
};

const EMPTY_FORM: FormState = {
  titulo_interno: "",
  tipo_propiedad: "",
  operacion: "",
  estado_interno: "",
  estado_publicacion: "",
  publicar_web: "",
  destacada: "",
  usuario_asignado_id: "",
  comentarios_internos: "",
  pais: "",
  provincia: "",
  ciudad: "",
  zona: "",
  barrio: "",
  direccion: "",
  precio: "",
  moneda: "",
  observaciones_comerciales: "",
  m2: "",
  m2_cubiertos: "",
  ambientes: "",
  dormitorios: "",
  banos: "",
  cochera: "",
  titulo_publico: "",
  subtitulo_publico: "",
  descripcion_corta: "",
  descripcion_larga: "",
  estado_tablero: "Asignada",
  comentario_cierre: "",
};

export default function PropertyForm({
  open,
  mode,
  users,
  initialData,
  saving = false,
  onClose,
  onSubmit,
}: PropertyFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        titulo_interno: initialData.titulo_interno || "",
        tipo_propiedad: initialData.tipo_propiedad || "",
        operacion: initialData.operacion || "",
        estado_interno: initialData.estado_interno || "",
        estado_publicacion: initialData.estado_publicacion || "",
        publicar_web: initialData.publicar_web || "",
        destacada: initialData.destacada || "",
        usuario_asignado_id: initialData.usuario_asignado_id || "",
        comentarios_internos: initialData.comentarios_internos || "",
        pais: initialData.pais || "",
        provincia: initialData.provincia || "",
        ciudad: initialData.ciudad || "",
        zona: initialData.zona || "",
        barrio: initialData.barrio || "",
        direccion: initialData.direccion || "",
        precio: initialData.precio || "",
        moneda: initialData.moneda || "",
        observaciones_comerciales: initialData.observaciones_comerciales || "",
        m2: initialData.m2 || "",
        m2_cubiertos: initialData.m2_cubiertos || "",
        ambientes: initialData.ambientes || "",
        dormitorios: initialData.dormitorios || "",
        banos: initialData.banos || "",
        cochera: initialData.cochera || "",
        titulo_publico: initialData.titulo_publico || "",
        subtitulo_publico: initialData.subtitulo_publico || "",
        descripcion_corta: initialData.descripcion_corta || "",
        descripcion_larga: initialData.descripcion_larga || "",
        estado_tablero: initialData.estado_tablero || "Asignada",
        comentario_cierre: initialData.comentario_cierre || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <div
      className="fixed inset-0 z-[140] bg-slate-950/45 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-3 md:p-6">
       <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
      >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 md:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Propiedades
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900 md:text-xl">
                {mode === "create" ? "Nueva propiedad" : "Editar propiedad"}
              </h2>
              {initialData?.codigo ? (
                <p className="mt-1 text-sm text-slate-500">Código automático: {initialData.codigo}</p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">El código se genera automáticamente al guardar.</p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            >
              ✕
            </button>
          </div>

         <form
            id="property-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-4 py-4 md:px-6"
          >
            <div className="space-y-5">
              <Section
                title="Datos básicos"
                description="Información principal de la propiedad."
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field
                    label="Título interno"
                    value={form.titulo_interno}
                    onChange={(v) => setField("titulo_interno", v)}
                  />
                  <SelectField
                    label="Tipo de propiedad"
                    value={form.tipo_propiedad}
                    onChange={(v) => setField("tipo_propiedad", v)}
                    options={["", "Casa", "Departamento", "Lote", "Local", "Dúplex", "Oficina"]}
                  />
                  <SelectField
                    label="Operación"
                    value={form.operacion}
                    onChange={(v) => setField("operacion", v)}
                    options={["", "Venta", "Alquiler", "Temporal"]}
                  />
                  <SelectField
                    label="Asignada a"
                    value={form.usuario_asignado_id}
                    onChange={(v) => setField("usuario_asignado_id", v)}
                    options={[
                      "",
                      ...users
                        .filter((u) => (u.estado || "").toLowerCase() !== "inactivo")
                        .map((u) => `${u.id}::${u.nombre_apellido}`),
                    ]}
                    renderOptionLabel={(opt) => {
                      if (!opt) return "Sin asignar";
                      return opt.split("::")[1] || opt;
                    }}
                    normalizeValue={(value) => value.split("::")[0] || ""}
                  />
                  <SelectField
                    label="Estado interno"
                    value={form.estado_interno}
                    onChange={(v) => setField("estado_interno", v)}
                    options={["", "Disponible", "Reservada", "Vendida", "Alquilada", "Pausada"]}
                  />
                  <SelectField
                    label="Estado publicación"
                    value={form.estado_publicacion}
                    onChange={(v) => setField("estado_publicacion", v)}
                    options={["", "Borrador", "Lista", "Publicada", "Oculta"]}
                  />
                  <SelectField
                    label="Publicar web"
                    value={form.publicar_web}
                    onChange={(v) => setField("publicar_web", v)}
                    options={["", "Sí", "No"]}
                  />
                  <SelectField
                    label="Destacada"
                    value={form.destacada}
                    onChange={(v) => setField("destacada", v)}
                    options={["", "Sí", "No"]}
                  />
                </div>
              </Section>

              <Section title="Ubicación" description="Datos básicos de ubicación.">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="País" value={form.pais} onChange={(v) => setField("pais", v)} />
                  <Field
                    label="Provincia"
                    value={form.provincia}
                    onChange={(v) => setField("provincia", v)}
                  />
                  <Field label="Ciudad" value={form.ciudad} onChange={(v) => setField("ciudad", v)} />
                  <Field label="Zona" value={form.zona} onChange={(v) => setField("zona", v)} />
                  <Field label="Barrio" value={form.barrio} onChange={(v) => setField("barrio", v)} />
                  <Field
                    label="Dirección"
                    value={form.direccion}
                    onChange={(v) => setField("direccion", v)}
                  />
                </div>
              </Section>

              <Section title="Precio y superficies" description="Datos comerciales principales.">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Precio" value={form.precio} onChange={(v) => setField("precio", v)} />
                  <SelectField
                    label="Moneda"
                    value={form.moneda}
                    onChange={(v) => setField("moneda", v)}
                    options={["", "USD", "ARS"]}
                  />
                  <Field label="m² total" value={form.m2} onChange={(v) => setField("m2", v)} />
                  <Field
                    label="m² cubiertos"
                    value={form.m2_cubiertos}
                    onChange={(v) => setField("m2_cubiertos", v)}
                  />
                  <Field
                    label="Ambientes"
                    value={form.ambientes}
                    onChange={(v) => setField("ambientes", v)}
                  />
                  <Field
                    label="Dormitorios"
                    value={form.dormitorios}
                    onChange={(v) => setField("dormitorios", v)}
                  />
                  <Field label="Baños" value={form.banos} onChange={(v) => setField("banos", v)} />
                  <Field
                    label="Cochera"
                    value={form.cochera}
                    onChange={(v) => setField("cochera", v)}
                  />
                </div>
              </Section>

              <Section title="Textos y observaciones" description="Contenido interno y público.">
                <div className="grid gap-4">
                  <Field
                    label="Título público"
                    value={form.titulo_publico}
                    onChange={(v) => setField("titulo_publico", v)}
                  />
                  <Field
                    label="Subtítulo público"
                    value={form.subtitulo_publico}
                    onChange={(v) => setField("subtitulo_publico", v)}
                  />
                  <TextAreaField
                    label="Descripción corta"
                    value={form.descripcion_corta}
                    onChange={(v) => setField("descripcion_corta", v)}
                  />
                  <TextAreaField
                    label="Descripción larga"
                    value={form.descripcion_larga}
                    onChange={(v) => setField("descripcion_larga", v)}
                  />
                  <TextAreaField
                    label="Observaciones comerciales"
                    value={form.observaciones_comerciales}
                    onChange={(v) => setField("observaciones_comerciales", v)}
                  />
                  <TextAreaField
                    label="Comentarios internos"
                    value={form.comentarios_internos}
                    onChange={(v) => setField("comentarios_internos", v)}
                  />
                </div>
              </Section>
            </div>
          </form>

          <div className="flex flex-col gap-2 border-t border-slate-200 bg-white px-4 py-3 md:flex-row md:items-center md:justify-end md:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="property-form"
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:opacity-95 disabled:opacity-60"
            >
              {saving ? "Guardando..." : mode === "create" ? "Guardar propiedad" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  renderOptionLabel,
  normalizeValue,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  renderOptionLabel?: (value: string) => string;
  normalizeValue?: (value: string) => string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <select
        value={value}
        onChange={(e) =>
          onChange(normalizeValue ? normalizeValue(e.target.value) : e.target.value)
        }
        className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
      >
        {options.map((option) => {
          const optionValue = normalizeValue ? normalizeValue(option) : option;
          return (
            <option key={option} value={optionValue}>
              {renderOptionLabel ? renderOptionLabel(option) : option || "Seleccionar"}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
      />
    </label>
  );
}
