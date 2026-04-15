export default function PropertyForm() {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Datos básicos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Información principal de la propiedad.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Código" placeholder="PRO-001" />
          <Field label="Título interno" placeholder="Casa en Chacras de Coria" />
          <SelectField
            label="Tipo de propiedad"
            options={[
              "Casa",
              "Departamento",
              "Lote",
              "Local",
              "Oficina",
              "Galpón",
              "PH",
              "Finca",
            ]}
          />
          <SelectField
            label="Operación"
            options={["Venta", "Alquiler", "Temporal"]}
          />

          <SelectField
            label="Estado interno"
            options={[
              "Disponible",
              "Reservada",
              "Vendida",
              "Alquilada",
              "Pausada",
            ]}
          />
          <SelectField
            label="Estado publicación"
            options={["Borrador", "Lista", "Publicada", "Oculta"]}
          />
          <SelectField label="Publicar web" options={["Sí", "No"]} />
          <SelectField label="Destacada" options={["Sí", "No"]} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Ubicación</h2>
        <p className="mt-1 text-sm text-slate-500">
          Datos de localización y visibilidad en web.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="País" placeholder="Argentina" />
          <Field label="Provincia" placeholder="Mendoza" />
          <Field label="Ciudad" placeholder="Luján de Cuyo" />
          <Field label="Zona / Barrio" placeholder="Chacras de Coria" />

          <Field label="Dirección" placeholder="Ej. Las Cubas 1234" />
          <Field label="Código postal" placeholder="5507" />
          <Field label="Latitud" placeholder="-32.98..." />
          <Field label="Longitud" placeholder="-68.88..." />

          <SelectField
            label="Mostrar dirección en web"
            options={["Sí", "No"]}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Precio y condiciones
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Valores comerciales y condiciones especiales.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Precio" placeholder="185000" />
          <SelectField label="Moneda" options={["USD", "ARS"]} />
          <Field label="Expensas" placeholder="0" />
          <SelectField label="Apto crédito" options={["Sí", "No"]} />

          <SelectField label="Financiación" options={["Sí", "No"]} />
          <SelectField label="Permuta" options={["Sí", "No"]} />
          <Field label="Precio publicado" placeholder="USD 185.000" />
          <Field label="Observaciones comerciales" placeholder="Opcional" />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Superficies y distribución
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Medidas, ambientes y estado general.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="m² total" placeholder="240" />
          <Field label="m² cubiertos" placeholder="180" />
          <Field label="Ambientes" placeholder="4" />
          <Field label="Dormitorios" placeholder="3" />

          <Field label="Baños" placeholder="2" />
          <Field label="Toilette" placeholder="1" />
          <SelectField
            label="Cochera"
            options={[
              "No",
              "Simple",
              "Doble",
              "Cubierta",
              "Descubierta",
            ]}
          />
          <Field label="Plantas" placeholder="2" />

          <Field label="Antigüedad" placeholder="10" />
          <SelectField
            label="Estado conservación"
            options={[
              "Excelente",
              "Muy Bueno",
              "Bueno",
              "Regular",
              "A refaccionar",
            ]}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Características y amenities
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Servicios y extras de la propiedad.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Calefacción"
            options={[
              "No",
              "Radiadores",
              "Losa radiante",
              "Estufa",
              "Central",
            ]}
          />
          <SelectField label="Aire acondicionado" options={["Sí", "No"]} />
          <SelectField label="Internet" options={["Sí", "No"]} />
          <SelectField label="Cable TV" options={["Sí", "No"]} />

          <SelectField label="Gas natural" options={["Sí", "No"]} />
          <SelectField label="Agua corriente" options={["Sí", "No"]} />
          <SelectField label="Amoblado" options={["Sí", "No"]} />
          <SelectField label="Barrio privado" options={["Sí", "No"]} />

          <SelectField label="Piscina" options={["Sí", "No"]} />
          <SelectField label="Quincho" options={["Sí", "No"]} />
          <SelectField label="Patio" options={["Sí", "No"]} />
          <SelectField label="Jardín" options={["Sí", "No"]} />

          <SelectField label="Terraza" options={["Sí", "No"]} />
          <SelectField label="Balcón" options={["Sí", "No"]} />
          <SelectField label="Lavandería" options={["Sí", "No"]} />
          <SelectField label="SUM" options={["Sí", "No"]} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Publicación web y textos
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Contenido visible en el sitio público.
        </p>

        <div className="mt-5 grid gap-4">
          <Field
            label="Título público"
            placeholder="Casa en venta en Chacras de Coria"
          />
          <Field
            label="Subtítulo público"
            placeholder="Luján de Cuyo, Mendoza"
          />
          <TextAreaField
            label="Descripción corta"
            placeholder="Resumen corto para cards y listados..."
          />
          <TextAreaField
            label="Descripción larga"
            placeholder="Texto completo de la propiedad..."
          />
          <Field
            label="Frase destacada"
            placeholder="Acepta crédito hipotecario"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Multimedia</h2>
        <p className="mt-1 text-sm text-slate-500">
          Links a imágenes, video y material extra.
        </p>

        <div className="mt-5 grid gap-4">
          <Field
            label="Imagen principal"
            placeholder="https://sitio.com/imagen-principal.jpg"
          />
          <TextAreaField
            label="Imágenes"
            placeholder="https://sitio.com/1.jpg | https://sitio.com/2.jpg | https://sitio.com/3.jpg"
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Video URL" placeholder="https://..." />
            <Field label="Tour virtual URL" placeholder="https://..." />
            <Field label="Plano URL" placeholder="https://..." />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Contacto comercial
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Datos de contacto para sistema y web.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Vendedor ID" placeholder="VEN-001" />
          <Field label="Propietario ID" placeholder="CLI-001" />
          <Field label="Teléfono contacto" placeholder="+54 9 261 ..." />
          <Field label="WhatsApp contacto" placeholder="+54 9 261 ..." />

          <Field label="Email contacto" placeholder="ventas@..." />
          <Field label="Asesor nombre" placeholder="Lucía Pérez" />
          <Field label="Sucursal" placeholder="Casa central" />
          <Field label="Slug" placeholder="casa-chacras-coria" />
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          Guardar borrador
        </button>
        <button className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:opacity-95">
          Guardar propiedad
        </button>
      </div>
    </div>
  );
}

type BaseFieldProps = {
  label: string;
  placeholder?: string;
};

function Field({ label, placeholder }: BaseFieldProps) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <input
        type="text"
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
      />
    </label>
  );
}

function SelectField({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <select className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, placeholder }: BaseFieldProps) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <textarea
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
      />
    </label>
  );
}