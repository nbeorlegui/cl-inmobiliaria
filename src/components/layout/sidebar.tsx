"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuItem } from "@/types";

type SidebarProps = {
  menu: MenuItem[];
};

export default function Sidebar({ menu }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-base font-bold text-white">
            CL
          </div>

          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
              CL Inmobiliaria
            </div>
            <div className="text-xs text-slate-500">Administrador</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {menu.map((item) => {
          const isRoot = item.href === "/";
          const isActive = isRoot ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-100"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="rounded-2xl bg-slate-50 p-3.5">
          <div className="text-sm font-semibold text-slate-900">
            Admin general
          </div>
          <div className="mt-1 text-[11px] leading-5 text-slate-500">
            Gestión centralizada de visitas, propiedades, vendedores y seguimiento comercial.
          </div>
        </div>
      </div>
    </aside>
  );
}