import { useCallback, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import JobCard from "@/features/jobs/components/JobCard";
import JobFilters from "@/features/jobs/components/JobFilters";
import { defaultJobFilters } from "@/features/jobs/constants";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import type { JobFilters as Filters } from "@/features/jobs/types";
import { cn, errorMessage } from "@/lib/utils";

export default function JobsPage() {
  const [filters, setFilters] = useState<Filters>(defaultJobFilters);
  const { data, isLoading, isError, error, refetch, isFetching } = useJobs(filters);

  // Any filter change goes back to page 1; passing `page` in the patch overrides that.
  const update = useCallback((patch: Partial<Filters>) => setFilters((f) => ({ ...f, page: 1, ...patch })), []);
  const reset = useCallback(() => setFilters(defaultJobFilters), []);

  return (
    <PageContainer title="Find Jobs" description="Search listings collected from your connected job sources.">
      <JobFilters value={filters} onChange={update} onReset={reset} />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
      ) : data && data.data.length === 0 ? (
        <EmptyState title="No jobs found" description="Try different keywords or clear some filters." />
      ) : data ? (
        <div className={cn(isFetching && "opacity-60 transition-opacity")}>
          <p className="mb-3 text-sm text-slate-500">{data.total} jobs found</p>
          <div className="space-y-4">
            {data.data.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onChange={(page) => {
              update({ page });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      ) : null}
    </PageContainer>
  );
}
