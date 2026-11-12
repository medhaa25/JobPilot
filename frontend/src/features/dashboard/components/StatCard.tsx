import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
}

export default function StatCard({ label, value, suffix = "", icon: Icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900">
          {value}
          {suffix}
        </p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}