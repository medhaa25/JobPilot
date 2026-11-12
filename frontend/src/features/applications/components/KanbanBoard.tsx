import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/types";
import { STATUS_OPTIONS } from "../constants";
import ApplicationCard from "./ApplicationCard";

interface Props {
  applications: Application[];
  onMove: (id: string, status: ApplicationStatus) => void;
}

export default function KanbanBoard({ applications, onMove }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<ApplicationStatus | null>(null);

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, [] as Application[]])) as Record<
      ApplicationStatus,
      Application[]
    >;
    applications.forEach((a) => map[a.status].push(a));
    return map;
  }, [applications]);

  const drop = (status: ApplicationStatus, e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    const app = applications.find((a) => a.id === id);
    setOverColumn(null);
    setDragId(null);
    if (app && app.status !== status) onMove(app.id, status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUS_OPTIONS.map((col) => (
        <section
          key={col.value}
          aria-label={col.label}
          onDragOver={(e) => {
            e.preventDefault();
            setOverColumn(col.value);
          }}
          onDragLeave={() => setOverColumn((c) => (c === col.value ? null : c))}
          onDrop={(e) => drop(col.value, e)}
          className={cn(
            "w-72 shrink-0 rounded-xl bg-slate-100 p-3 transition-shadow",
            overColumn === col.value && "ring-2 ring-indigo-400",
          )}
        >
          <header className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-700">{col.label}</h2>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{byStatus[col.value].length}</span>
          </header>
          <div className="min-h-16 space-y-3">
            {byStatus[col.value].map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onMove={onMove}
                onDragStart={setDragId}
                onDragEnd={() => {
                  setDragId(null);
                  setOverColumn(null);
                }}
              />
            ))}
            {byStatus[col.value].length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-xs text-slate-400">
                Drop here
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
