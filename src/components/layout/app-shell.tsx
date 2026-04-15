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
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.10),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#f6f8fc_100%)]">
      <Sidebar menu={filteredMenu} />

      <main className="min-w-0 flex-1 overflow-y-auto p-3">
        <div className={contentClassName}>{children}</div>
      </main>
    </div>
  );
}