"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuItem } from "@/types";

type SidebarProps = {
  menu: MenuItem[];
  mobileOpen?: boolean;
  onClose?: () => void;
};

function SidebarContent({
  menu,
  pathname,
  onClose,
}: {
  menu: MenuItem[];
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-bold text-white">
            CL
          </div>

          <div className="min-w-0">
            <div className="truncate text-lg font-semibold tracking-tight text-slate-900">
              CL Inmobiliaria
            </div>
            <div className="text-xs text-slate-500">Real estate dashboard</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5">
        {menu.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">
            Admin general
          </div>
          <div className="mt-1 text-xs leading-5 text-slate-500">
            Gestión centralizada de visitas, propiedades, usuarios y seguimiento comercial.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({
  menu,
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white md:flex">
        <SidebarContent menu={menu} pathname={pathname} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-950/45"
            onClick={onClose}
          />

          <div className="absolute inset-y-0 left-0 w-[84vw] max-w-[320px] overflow-hidden rounded-r-[28px] shadow-2xl">
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            <SidebarContent menu={menu} pathname={pathname} onClose={onClose} />
          </div>
        </div>
      )}
    </>
  );
}