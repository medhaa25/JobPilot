import { Link } from "react-router-dom";
import { GripVertical } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/types";
import { STATUS_OPTIONS } from "../constants";

interface Props {
  application: Application;
  onMove: (id: string, status: ApplicationStatus) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

export default function ApplicationCard({ application: app, onMove, onDragStart, onDragEnd }: Props) {
  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", app.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(app.id);
      }}
      onDragEnd={onDragEnd}
      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <GripVertical size={14} className="mt-1 shrink-0 text-slate-300" aria-hidden />
        <div className="min-w-0">
          <Link to={`/applications/${app.id}`} className="block truncate font-medium text-slate-900 hover:text-indigo-600">
            {app.jobTitle}
          </Link>
          <p className="truncate text-sm text-slate-600">{app.company}</p>
          <p className="mt-1 text-xs text-slate-400">
            {app.appliedAt ? `Applied ${formatDate(app.appliedAt)}` : "Not applied yet"}
          </p>
        </div>
      </div>
      {/* Keyboard / touch alternative to dragging */}
      <select
        aria-label={`Move ${app.jobTitle} to another column`}
        value={app.status}
        onChange={(e) => onMove(app.id, e.target.value as ApplicationStatus)}
        className="mt-3 w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </article>
  );
}
