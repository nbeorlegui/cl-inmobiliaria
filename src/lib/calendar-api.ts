const API_URL =
  "https://script.google.com/macros/s/AKfycbwuuNcZunkJB8Uv3dW6J412CryGVKL3V88aBikEB2lKnUMPkakAc1TnsVRjehfsRPtZ/exec";

export type SheetsUser = {
  id: string;
  nombre_apellido: string;
  email: string;
  telefono: string;
  usuario: string;
  rol: string;
  color_calendario: string;
  estado: string;
};

export type RemoteEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  type: string;
  priority: string;
  status: string;
  assignedUserId: string;
  createdById: string;
  contactoId: string;
  clienteId: string;
  propiedadId: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardAction = {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  assignedUserName: string;
  alertLevel: "red" | "yellow" | "green" | "gray";
  priority: string;
  status: string;
};

export type DashboardProperty = {
  id: string;
  title: string;
  operation: string;
  price: string;
  location: string;
  image: string;
};

export type DashboardSummary = {
  totalProperties: number;
  todayEvents: number;
  urgentEvents: number;
  upcomingEvents: number;
};

export type PropertyBoardStatus =
  | "Asignada"
  | "Visita coordinada"
  | "Visitada"
  | "Finalizada";

export type PropertyItem = {
  id: string;
  codigo: string;
  titulo_interno: string;
  tipo_propiedad: string;
  operacion: string;
  estado_interno: string;
  estado_publicacion: string;
  publicar_web: string;
  destacada: string;
  slug: string;
  fecha_alta: string;
  fecha_actualizacion: string;
  usuario_asignado_id: string;
  usuario_asignado_nombre?: string;
  propietario_id: string;
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
  estado_tablero: PropertyBoardStatus | string;
  comentario_cierre: string;
  activo: boolean | string;
  updated_at: string;
  deleted_at: string;
};

export type PropertyPayload = Partial<PropertyItem>;

export async function loginWithSheets(usuario: string, clave: string): Promise<{
  ok: boolean;
  user?: SheetsUser;
  error?: string;
}> {
  const url = `${API_URL}?action=login&usuario=${encodeURIComponent(
    usuario
  )}&clave=${encodeURIComponent(clave)}`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  return await res.json();
}

export async function listUsersFromSheets(): Promise<{
  ok: boolean;
  users?: SheetsUser[];
  error?: string;
}> {
  const res = await fetch(`${API_URL}?action=listUsers`, {
    method: "GET",
    cache: "no-store",
  });

  return await res.json();
}

export async function getDashboardDataFromSheets(
  userId: string,
  role: string
): Promise<{
  ok: boolean;
  summary?: DashboardSummary;
  todayActions?: DashboardAction[];
  properties?: DashboardProperty[];
  error?: string;
}> {
  try {
    const res = await fetch(
      `/api/sheets/dashboard?userId=${encodeURIComponent(
        userId
      )}&role=${encodeURIComponent(role)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      return {
        ok: false,
        error: "La respuesta del dashboard no fue JSON válido",
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to fetch",
    };
  }
}

export async function createUserInSheets(payload: Record<string, unknown>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "createUser",
      payload,
    }),
  });

  return await res.json();
}

export async function updateUserInSheets(payload: Record<string, unknown>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "updateUser",
      payload,
    }),
  });

  return await res.json();
}

export async function deleteUserInSheets(id: string) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "deleteUser",
      payload: { id },
    }),
  });

  return await res.json();
}

export async function listEventsFromSheets(userId: string, role: string): Promise<{
  ok: boolean;
  events?: RemoteEvent[];
  error?: string;
}> {
  const url = `${API_URL}?action=listEvents&userId=${encodeURIComponent(
    userId
  )}&role=${encodeURIComponent(role)}`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  return await res.json();
}

export async function createEventInSheets(payload: Record<string, unknown>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "createEvent",
      payload,
    }),
  });

  return await res.json();
}

export async function updateEventInSheets(payload: Record<string, unknown>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "updateEvent",
      payload,
    }),
  });

  return await res.json();
}

export async function deleteEventInSheets(id: string) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "deleteEvent",
      payload: { id },
    }),
  });

  return await res.json();
}

export async function listPropertiesFromSheets(
  userId: string,
  role: string
): Promise<{
  ok: boolean;
  properties?: PropertyItem[];
  error?: string;
}> {
  const url = `${API_URL}?action=listProperties&userId=${encodeURIComponent(
    userId
  )}&role=${encodeURIComponent(role)}`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  return await res.json();
}

export async function createPropertyInSheets(payload: PropertyPayload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "createProperty",
      payload,
    }),
  });

  return await res.json();
}

export async function updatePropertyInSheets(
  payload: PropertyPayload & { id: string }
) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "updateProperty",
      payload,
    }),
  });

  return await res.json();
}

export async function deletePropertyInSheets(id: string) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "deleteProperty",
      payload: { id },
    }),
  });

  return await res.json();
}

export async function updatePropertyBoardStatusInSheets(payload: {
  id: string;
  estado_tablero: PropertyBoardStatus | string;
  comentario_cierre?: string;
}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "updatePropertyBoardStatus",
      payload,
    }),
  });

  return await res.json();
}
