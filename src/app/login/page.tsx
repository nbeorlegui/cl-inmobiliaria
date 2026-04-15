"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithSheets } from "@/lib/calendar-api";
import { getSessionUser, saveSessionUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSessionUser();
    if (session) {
      router.replace("/calendario");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await loginWithSheets(usuario.trim(), clave.trim());

    if (!res.ok || !res.user) {
      setError(res.error || "No se pudo iniciar sesión");
      setLoading(false);
      return;
    }

    saveSessionUser(res.user);
    router.replace("/calendario");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.10),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#f6f8fc_100%)] p-4">
      <div className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-bold text-white">
            CL
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            CL Inmobiliaria
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Accedé con tu usuario y contraseña para ver tus eventos y asignaciones.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Usuario
            </label>
            <input
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="Ingresá tu usuario"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="Ingresá tu contraseña"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(59,130,246,0.28)] transition hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}