"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      Cerrar sesión
    </button>
  );
}