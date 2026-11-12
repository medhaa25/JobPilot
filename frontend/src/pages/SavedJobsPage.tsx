import { Link } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { buttonStyles } from "@/components/ui/Button";
import JobCard from "@/features/jobs/components/JobCard";
import { defaultJobFilters } from "@/features/jobs/constants";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { errorMessage } from "@/lib/utils";
import type { JobFilters } from "@/features/jobs/types";

const savedFilters: JobFilters = { ...defaultJobFilters, saved: true, pageSize: 100 };

export default function SavedJobsPage() {
  const { data, isLoading, isError, error, refetch } = useJobs(savedFilters);

  return (
    <PageContainer title="Saved Jobs" description="Jobs you've bookmarked. Turn any of them into an application.">
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="No saved jobs yet"
          description="Bookmark jobs while browsing and they'll show up here."
          action={
            <Link to="/jobs" className={buttonStyles("primary")}>
              Find jobs
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {data.data.map((job) => (
            <JobCard key={job.id} job={job} showTrackButton />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
