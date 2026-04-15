export type UserRole = "admin" | "seller";

export type AppUser = {
  id: string;
  name: string;
  role: UserRole;
};

export type CalendarEventType = "visita" | "llamada" | "reunion" | "tarea" | "otro";

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: CalendarEventType;
  urgent: boolean;
  assignedUserId: string;
  assignedUserName: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
};

export type EventFormValues = {
  title: string;
  description: string;
  date: string;
  time: string;
  type: CalendarEventType;
  urgent: boolean;
  assignedUserId: string;
};