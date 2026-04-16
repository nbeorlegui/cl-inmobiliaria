"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { APP_MENU } from "@/lib/app-menu";
import { clearSessionUser, getSessionUser, type SessionUser } from "@/lib/auth";
import {
  createUserInSheets,
  deleteUserInSheets,
  listUsersFromSheets,
  updateUserInSheets,
  type SheetsUser,
} from "@/lib/calendar-api";
import { getCachedData, setCachedData } from "@/lib/view-cache";

type UserForm = {
  nombre_apellido: string;
  email: string;
  telefono: string;
  usuario: string;
  clave: string;
  rol: "admin" | "vendedor";
  estado: string;
  color_calendario: string;
  observaciones: string;
};

const EMPTY_FORM: UserForm = {
  nombre_apellido: "",
  email: "",
  telefono: "",
  usuario: "",
  clave: "",
  rol: "vendedor",
  estado: "activo",
  color_calendario: "#2563eb",
  observaciones: "",
};

const USER_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#64748b",
];

export default function UsuariosPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<SheetsUser[]>([]);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SheetsUser | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadUsers() {
    const res = await listUsersFromSheets();
    const nextUsers = res.users || [];
    setUsers(nextUsers);
    setCachedData<SheetsUser[]>("users:list", nextUsers);
  }

  useEffect(() => {
    const currentSession = getSessionUser();

    if (!currentSession) {
      router.replace("/login");
      return;
    }

    if (currentSession.rol !== "admin") {
      setSession(currentSession);
      setLoading(false);
      return;
    }

    setSession(currentSession);

    const cachedUsers = getCachedData<SheetsUser[]>("users:list");
    if (cachedUsers) {
      setUsers(cachedUsers);
      setLoading(false);
    }

    loadUsers().finally(() => setLoading(false));
  }, [router]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = search.toLowerCase();
      return (
        user.nombre_apellido.toLowerCase().includes(term) ||
        user.usuario.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    });
  }, [users, search]);

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.rol === "admin").length;
  const totalSellers = users.filter((u) => u.rol !== "admin").length;

  function handleLogout() {
    clearSessionUser();
    router.replace("/login");
  }

  function openCreateModal() {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(user: SheetsUser) {
    setEditingUser(user);
    setForm({
      nombre_apellido: user.nombre_apellido || "",
      email: user.email || "",
      telefono: user.telefono || "",
      usuario: user.usuario || "",
      clave: "",
      rol: user.rol === "admin" ? "admin" : "vendedor",
      estado: user.estado || "activo",
      color_calendario: user.color_calendario || "#2563eb",
      observaciones: "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingUser) {
        const optimisticUsers = users.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                nombre_apellido: form.nombre_apellido.trim(),
                email: form.email.trim(),
                telefono: form.telefono.trim(),
                usuario: form.usuario.trim(),
                rol: form.rol,
                estado: form.estado,
                color_calendario: form.color_calendario,
              }
            : u
        );

        setUsers(optimisticUsers);
        setCachedData("users:list", optimisticUsers);
        setModalOpen(false);

        const res = await updateUserInSheets({
          id: editingUser.id,
          nombre_apellido: form.nombre_apellido.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim(),
          usuario: form.usuario.trim(),
          clave: form.clave.trim(),
          rol: form.rol,
          estado: form.estado,
          color_calendario: form.color_calendario,
          observaciones: form.observaciones.trim(),
        });

        if (!res.ok) throw new Error(res.error || "No se pudo editar el usuario");

        await loadUsers();
      } else {
        const tempUser: SheetsUser = {
          id: `tmp_${crypto.randomUUID()}`,
          nombre_apellido: form.nombre_apellido.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim(),
          usuario: form.usuario.trim(),
          rol: form.rol,
          color_calendario: form.color_calendario,
          estado: form.estado,
        };

        const optimisticUsers = [tempUser, ...users];
        setUsers(optimisticUsers);
        setCachedData("users:list", optimisticUsers);
        setModalOpen(false);

        const res = await createUserInSheets({
          nombre_apellido: form.nombre_apellido.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim(),
          usuario: form.usuario.trim(),
          clave: form.clave.trim(),
          rol: form.rol,
          estado: form.estado,
          color_calendario: form.color_calendario,
          creado_por: session?.usuario || "admin",
          observaciones: form.observaciones.trim(),
        });

        if (!res.ok) throw new Error(res.error || "No se pudo crear el usuario");

        await loadUsers();
      }

      setEditingUser(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      await loadUsers();
      setError(err instanceof Error ? err.message : "Ocurrió un error");
      setModalOpen(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: SheetsUser) {
    const ok = window.confirm(`¿Eliminar de la app al usuario ${user.nombre_apellido}?`);
    if (!ok) return;

    const previousUsers = users;
    const optimisticUsers = users.filter((u) => u.id !== user.id);
    setUsers(optimisticUsers);
    setCachedData("users:list", optimisticUsers);

    const res = await deleteUserInSheets(user.id);
    if (res.ok) {
      await loadUsers();
    } else {
      setUsers(previousUsers);
      setCachedData("users:list", previousUsers);
    }
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

  const isAdmin = session.rol === "admin";

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
                Usuarios
              </h1>
              <p className="mt-1 max-w-2xl text-[13px] text-slate-500">
                Administración general de usuarios del sistema.
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

        {!isAdmin ? (
          <div className="rounded-[24px] border border-red-100 bg-white/90 p-8 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="rounded-[20px] border border-red-100 bg-red-50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-400">
                Acceso restringido
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                No tenés permisos para ver este módulo
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Los usuarios con rol vendedor no pueden acceder a la administración de usuarios.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3 grid gap-2.5 md:grid-cols-3">
              <div className="rounded-[20px] bg-gradient-to-r from-blue-600 to-blue-500 p-3.5 text-white shadow-[0_10px_24px_rgba(37,99,235,0.16)]">
                <p className="text-[13px] font-medium text-white/80">Usuarios</p>
                <p className="mt-1.5 text-[2rem] font-semibold">{totalUsers}</p>
                <p className="mt-1 text-[12px] text-white/80">Total cargado</p>
              </div>

              <div className="rounded-[20px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-3.5 text-white shadow-[0_10px_24px_rgba(139,92,246,0.18)]">
                <p className="text-[13px] font-medium text-white/80">Admins</p>
                <p className="mt-1.5 text-[2rem] font-semibold">{totalAdmins}</p>
                <p className="mt-1 text-[12px] text-white/80">Con acceso completo</p>
              </div>

              <div className="rounded-[20px] bg-gradient-to-r from-cyan-500 to-sky-500 p-3.5 text-white shadow-[0_10px_24px_rgba(14,165,233,0.16)]">
                <p className="text-[13px] font-medium text-white/80">Vendedores</p>
                <p className="mt-1.5 text-[2rem] font-semibold">{totalSellers}</p>
                <p className="mt-1 text-[12px] text-white/80">Usuarios operativos</p>
              </div>
            </div>

            <div className="mb-3 rounded-[24px] border border-white/60 bg-white/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, usuario o mail..."
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_12px_26px_rgba(59,130,246,0.22)] transition hover:scale-[1.01]"
                >
                  + Nuevo usuario
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/60 bg-white/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Listado
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  Usuarios creados
                </h2>
              </div>

              <div className="hidden overflow-hidden rounded-[18px] border border-slate-200 md:block">
                <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  <div className="col-span-3">Usuario</div>
                  <div className="col-span-2">Rol</div>
                  <div className="col-span-2">Teléfono</div>
                  <div className="col-span-3">Mail</div>
                  <div className="col-span-2 text-right">Acción</div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[13px] text-slate-500">
                    No hay usuarios para mostrar.
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="grid grid-cols-12 gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0"
                    >
                      <div className="col-span-3 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-3.5 w-3.5 rounded-full"
                            style={{ backgroundColor: user.color_calendario || "#2563eb" }}
                          />
                          <div>
                            <p className="truncate text-[13px] font-semibold text-slate-900">
                              {user.nombre_apellido}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-500">
                              {user.usuario}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 text-[13px] text-slate-700">
                        {user.rol}
                      </div>

                      <div className="col-span-2 text-[13px] text-slate-700">
                        {user.telefono}
                      </div>

                      <div className="col-span-3 text-[13px] text-slate-700">
                        {user.email}
                      </div>

                      <div className="col-span-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Editar
                        </button>

                        {user.usuario.toLowerCase() !== "nicolas" && (
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-medium text-red-600 transition hover:bg-red-100"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3 md:hidden">
                {filteredUsers.length === 0 ? (
                  <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-[13px] text-slate-500">
                    No hay usuarios para mostrar.
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-3.5 w-3.5 rounded-full"
                              style={{ backgroundColor: user.color_calendario || "#2563eb" }}
                            />
                            <p className="truncate text-[15px] font-semibold text-slate-900">
                              {user.nombre_apellido}
                            </p>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">{user.usuario}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                            Rol
                          </p>
                          <p className="mt-1 text-slate-700">{user.rol}</p>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                            Teléfono
                          </p>
                          <p className="mt-1 text-slate-700">{user.telefono}</p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                            Mail
                          </p>
                          <p className="mt-1 break-all text-slate-700">{user.email}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          Editar
                        </button>

                        {user.usuario.toLowerCase() !== "nicolas" && (
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {modalOpen && (
          <div className="fixed inset-0 z-[90] bg-slate-950/45 backdrop-blur-[2px]">
            <div className="flex min-h-screen items-start justify-center p-2 sm:p-4">
              <div className="flex h-[calc(100dvh-16px)] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:h-auto sm:max-h-[92dvh] sm:rounded-[28px]">
                <div className="shrink-0 border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-blue-50 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        CL Inmobiliaria
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
                        {editingUser ? "Editar usuario" : "Nuevo usuario"}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setModalOpen(false);
                        setEditingUser(null);
                      }}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Nombre y apellido
                        </label>
                        <input
                          value={form.nombre_apellido}
                          onChange={(e) => setForm((p) => ({ ...p, nombre_apellido: e.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Mail
                        </label>
                        <input
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Teléfono
                        </label>
                        <input
                          value={form.telefono}
                          onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Usuario
                        </label>
                        <input
                          value={form.usuario}
                          onChange={(e) => setForm((p) => ({ ...p, usuario: e.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Contraseña {editingUser ? "(dejar vacío para no cambiar)" : ""}
                        </label>
                        <input
                          type="password"
                          value={form.clave}
                          onChange={(e) => setForm((p) => ({ ...p, clave: e.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Rol
                        </label>
                        <select
                          value={form.rol}
                          onChange={(e) => setForm((p) => ({ ...p, rol: e.target.value as "admin" | "vendedor" }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        >
                          <option value="admin">Admin</option>
                          <option value="vendedor">Vendedor</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Estado
                        </label>
                        <select
                          value={form.estado}
                          onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        >
                          <option value="activo">Activo</option>
                          <option value="inactivo">Inactivo</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Color calendario
                        </label>

                        <div className="rounded-2xl border border-slate-200 bg-white p-3">
                          <div className="flex flex-wrap gap-2">
                            {USER_COLORS.map((color) => {
                              const selected = form.color_calendario === color;

                              return (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() =>
                                    setForm((prev) => ({
                                      ...prev,
                                      color_calendario: color,
                                    }))
                                  }
                                  className={`relative h-10 w-10 rounded-full border-4 transition ${
                                    selected
                                      ? "scale-110 border-slate-900 shadow-md"
                                      : "border-white hover:scale-105 hover:shadow-sm"
                                  }`}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                >
                                  {selected && (
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                      ✓
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                            <span
                              className="inline-block h-5 w-5 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: form.color_calendario }}
                            />
                            <span className="text-sm text-slate-600">
                              Color seleccionado:{" "}
                              <span className="font-medium text-slate-900">{form.color_calendario}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Observaciones
                        </label>
                        <textarea
                          rows={3}
                          value={form.observaciones}
                          onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
                          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setModalOpen(false);
                          setEditingUser(null);
                        }}
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(59,130,246,0.28)] transition hover:scale-[1.01] disabled:opacity-60 sm:w-auto"
                      >
                        {saving ? "Guardando..." : editingUser ? "Guardar cambios" : "Crear usuario"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    </AppShell>
  );
}