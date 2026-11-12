import { NavLink } from "react-router-dom";
import {  Bookmark, Briefcase, KanbanSquare, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Find Jobs", icon: Briefcase },
  { to: "/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { to: "/applications", label: "Applications", icon: KanbanSquare },
  // { to: "/interviews", label: "Interviews", icon: CalendarClock },
  // { to: "/analytics", label: "Analytics", icon: BarChart3 },
  // { to: "/profile", label: "Profile", icon: User },
  // { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="px-5 py-5 text-xl font-bold text-indigo-600">JobPilot</div>
      <nav className="space-y-1 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100",
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
