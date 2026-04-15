import Sidebar from "@/components/layout/sidebar";
import { menu } from "@/lib/mock-data";

type PageShellProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export default function PageShell({
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar menu={menu} />

        <main className="flex-1">
          <section className="border-b border-slate-200 bg-white">
            <div className="px-5 py-5 md:px-8">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                Módulo
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                {title}
              </h1>

              {description ? (
                <p className="mt-2 max-w-3xl text-sm text-slate-500 md:text-base">
                  {description}
                </p>
              ) : null}
            </div>
          </section>

          <section className="px-5 py-5 md:px-8 md:py-8">{children}</section>
        </main>
      </div>
    </div>
  );
}