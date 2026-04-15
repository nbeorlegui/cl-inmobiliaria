import type { Stat } from "@/types";

type StatsGridProps = {
  stats: Stat[];
};

const statStyles = [
  {
    tone: "from-blue-600 to-blue-500",
    detail: "12 nuevas este mes",
  },
  {
    tone: "from-violet-600 to-violet-500",
    detail: "4 de prioridad alta",
  },
  {
    tone: "from-cyan-500 to-sky-500",
    detail: "Ingresados por WhatsApp y Meta",
  },
  {
    tone: "from-fuchsia-600 to-purple-500",
    detail: "Seguimientos para hoy",
  },
];

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const style = statStyles[index] ?? statStyles[0];

        return (
          <div
            key={stat.label}
            className={`overflow-hidden rounded-3xl bg-gradient-to-br ${style.tone} p-5 text-white shadow-lg shadow-slate-200`}
          >
            <div className="text-sm font-medium text-white/80">{stat.label}</div>
            <div className="mt-3 text-4xl font-semibold tracking-tight">
              {stat.value}
            </div>
            <div className="mt-3 text-xs text-white/80">{style.detail}</div>
          </div>
        );
      })}
    </div>
  );
}