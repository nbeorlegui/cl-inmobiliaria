import type { Agent, MenuItem, PropertyItem, Stat, Visit } from "@/types";

export const stats: Stat[] = [
  { label: "Propiedades activas", value: "128" },
  { label: "Visitas de hoy", value: "14" },
  { label: "Contactos nuevos", value: "23" },
  { label: "Tareas pendientes", value: "8" },
];

export const visits: Visit[] = [
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
    time: "12:00",
    client: "Inversor | Grupo Andino",
    property: "Lote Godoy Cruz",
    agent: "Lucía Pérez",
    type: "Seguimiento",
    urgency: "Baja",
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

export const properties: PropertyItem[] = [
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
  {
    code: "CL-097",
    title: "Lote premium",
    op: "Venta",
    price: "USD 73.000",
    zone: "Maipú",
    status: "Disponible",
    surface: "820 m²",
    rooms: "Lote",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  },
];

export const agents: Agent[] = [
  {
    name: "Lucía Pérez",
    role: "Vendedora",
    today: ["09:00 - Depto. Palmares", "12:00 - Seguimiento Grupo Andino"],
    total: 2,
  },
  {
    name: "Tomás Díaz",
    role: "Vendedor",
    today: ["10:30 - Llamada Casa Chacras", "15:00 - Visita lote Guaymallén"],
    total: 2,
  },
  {
    name: "Bruno Gil",
    role: "Vendedor",
    today: ["16:30 - Local Centro"],
    total: 1,
  },
];

export const menu: MenuItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Propiedades", href: "/propiedades" },
  { label: "Contactos", href: "/contactos" },
  { label: "Acciones", href: "/acciones" },
  { label: "Calendario", href: "/calendario" },
  { label: "Clientes", href: "/clientes" },
  { label: "Inversores", href: "/inversores" },
  { label: "Vendedores", href: "/vendedores" },
];

export function getUrgencyClasses(urgency: "Alta" | "Media" | "Baja") {
  if (urgency === "Alta") return "border-l-red-500 bg-red-50";
  if (urgency === "Media") return "border-l-amber-400 bg-amber-50";
  return "border-l-emerald-500 bg-emerald-50";
}