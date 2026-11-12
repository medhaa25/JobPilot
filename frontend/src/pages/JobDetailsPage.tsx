import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonStyles } from "@/components/ui/Button";
import { useJob, useToggleSaveJob } from "@/features/jobs/hooks/useJobs";
import { buildTrackerUrl } from "@/features/jobs/utils";
import { errorMessage, formatDate, formatSalary } from "@/lib/utils";

export default function JobDetailsPage() {
  const { jobId = "" } = useParams();
  const { data: job, isLoading, isError, error, refetch } = useJob(jobId);
  const toggle = useToggleSaveJob();

  const back = (
    <Link to="/jobs" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
      <ArrowLeft size={14} /> Back to jobs
    </Link>
  );

  if (isLoading)
    return (
      <PageContainer title="Job Details">
        <Skeleton className="h-72" />
      </PageContainer>
    );

  if (isError || !job)
    return (
      <PageContainer title="Job Details">
        {back}
        <ErrorState message={errorMessage(error, "Job not found")} onRetry={() => void refetch()} />
      </PageContainer>
    );

  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const facts: Array<[string, string | null]> = [
    ["Location", job.location],
    ["Employment type", job.employmentType],
    ["Experience", job.experienceLevel],
    ["Salary", salary],
    ["Posted", formatDate(job.postedAt)],
    ["Source", job.source],
  ];

  return (
    <PageContainer title={job.title} description={job.company}>
      {back}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-slate-900">Job description</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{job.description}</p>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <dl className="space-y-3 text-sm">
              {facts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-medium text-slate-800">{value ?? "Not listed"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.employmentType && <Badge tone="indigo">{job.employmentType}</Badge>}
              {job.experienceLevel && <Badge tone="purple">{job.experienceLevel}</Badge>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles("primary")}>
              Apply on {job.source} <ExternalLink size={14} />
            </a>
            <Link to={buildTrackerUrl(job)} className={buttonStyles("secondary")}>
              Add to application tracker
            </Link>
            <Button
              variant="secondary"
              loading={toggle.isPending}
              onClick={() => toggle.mutate({ id: job.id, saved: job.isSaved })}
            >
              {job.isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {job.isSaved ? "Saved — click to remove" : "Save job"}
            </Button>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
