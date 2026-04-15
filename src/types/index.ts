export type Stat = {
  label: string;
  value: string;
};

export type Visit = {
  time: string;
  client: string;
  property: string;
  agent: string;
  type: "Visita" | "Llamada" | "Seguimiento";
  urgency: "Alta" | "Media" | "Baja";
};

export type PropertyItem = {
  code: string;
  title: string;
  op: "Venta" | "Alquiler";
  price: string;
  zone: string;
  status: string;
  surface?: string;
  rooms?: string;
  image?: string;
};

export type Agent = {
  name: string;
  role: string;
  today: string[];
  total?: number;
};

export type MenuItem = {
  label: string;
  href: string;
};

export type UserRole = "admin" | "vendedor";

export type SessionUser = {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
};