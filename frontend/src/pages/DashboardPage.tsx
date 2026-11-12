import { Link } from "react-router-dom";
import { Activity, ClipboardList, Percent, Trophy } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { buttonStyles } from "@/components/ui/Button";
import StatusBadge from "@/features/applications/components/StatusBadge";
import StatCard from "@/features/dashboard/components/StatCard";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { errorMessage, formatDate} from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  return (
    <PageContainer title="Dashboard" description="Your job search at a glance.">
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      ) : isError || !data ? (
        <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
     <StatCard label="Total applications" value={data.totalApplications} icon={ClipboardList} />
     <StatCard label="In progress" value={data.inProgress} icon={Activity} />
     <StatCard label="Offers received" value={data.offers} icon={Trophy} />
     <StatCard label="Response rate" value={data.responseRate} suffix="%" icon={Percent} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/jobs" className={buttonStyles("primary")}>
              Find jobs
            </Link>
            <Link to="/applications/new" className={buttonStyles("secondary")}>
              Add application
            </Link>
            <Link to="/applications" className={buttonStyles("secondary")}>
              Open board
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-semibold text-slate-900">Recent applications</h2>
              {data.recentApplications.length === 0 ? (
                <p className="text-sm text-slate-500">Nothing yet — add your first application.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.recentApplications.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <Link to={`/applications/${a.id}`} className="block truncate text-sm font-medium text-slate-900 hover:text-indigo-600">
                          {a.jobTitle}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {a.company} · {formatDate(a.appliedAt)}
                        </p>
                      </div>
                      <StatusBadge status={a.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-semibold text-slate-900">Upcoming interviews</h2>
              {data.upcomingInterviews.length === 0 ? (
                <p className="text-sm text-slate-500">No upcoming interviews.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.upcomingInterviews.map((i) => (
                    <li key={i.id} className="py-3">
                      <Link to={`/applications/${i.applicationId}`} className="text-sm font-medium text-slate-900 hover:text-indigo-600">
                        {i.company} — {i.jobTitle}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {i.round} · {i.type} · {formatDateTime(i.scheduledAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section> */}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
