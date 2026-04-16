"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import type { MenuItem } from "@/types";
import { getSessionUser } from "@/lib/auth";

type AppShellProps = {
  menu: MenuItem[];
  children: ReactNode;
  contentClassName?: string;
};

const SUPERADMIN_USERNAME = "nicolas";
const HIDDEN_UNTIL_READY = [
  "/acciones",
  "/inversores",
  "/clientes",
  "/contactos",
];

export default function AppShell({
  menu,
  children,
  contentClassName = "mx-auto w-full max-w-[1500px]",
}: AppShellProps) {
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const session = getSessionUser();
    setRole(session?.rol || null);
    setUsername((session?.usuario || "").trim().toLowerCase());
  }, []);

  const filteredMenu = useMemo(() => {
    const isSuperadmin = username === SUPERADMIN_USERNAME;
    const isSeller = role === "vendedor";

    return menu.filter((item) => {
      if (!isSuperadmin && HIDDEN_UNTIL_READY.includes(item.href)) {
        return false;
      }

      if (item.href === "/vendedores" && isSeller) {
        return false;
      }

      return true;
    });
  }, [menu, role, username]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.10),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#f6f8fc_100%)] md:flex">
      <Sidebar
        menu={filteredMenu}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/92 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg text-slate-700 shadow-sm"
              aria-label="Abrir menú"
            >
              ☰
            </button>

            <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white">
                CL
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  CL Inmobiliaria
                </div>
              </div>
            </div>

            <div className="h-11 w-11 shrink-0" />
          </div>
        </header>

        <main className="min-w-0 p-3 md:h-screen md:overflow-y-auto md:p-4">
          <div className={contentClassName}>{children}</div>
        </main>
      </div>
    </div>
  );
}