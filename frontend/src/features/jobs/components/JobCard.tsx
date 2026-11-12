import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Clock, ExternalLink, MapPin, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { formatDate, formatSalary } from "@/lib/utils";
import type { Job } from "@/types";
import { useToggleSaveJob } from "../hooks/useJobs";
import { buildTrackerUrl } from "../utils";

interface JobCardProps {
  job: Job;
  showTrackButton?: boolean;
}

export default function JobCard({ job, showTrackButton = false }: JobCardProps) {
  const toggle = useToggleSaveJob();
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to={`/jobs/${job.id}`} className="text-lg font-semibold text-slate-900 hover:text-indigo-600">
            {job.title}
          </Link>
          <p className="text-sm text-slate-600">{job.company}</p>
        </div>
        <button
          type="button"
          aria-label={job.isSaved ? "Remove from saved jobs" : "Save job"}
          aria-pressed={job.isSaved}
          disabled={toggle.isPending}
          onClick={() => toggle.mutate({ id: job.id, saved: job.isSaved })}
          className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
        >
          {job.isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MapPin size={14} /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={14} /> Posted {formatDate(job.postedAt)}
        </span>
        {salary && (
          <span className="inline-flex items-center gap-1">
            <Wallet size={14} /> {salary}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {job.employmentType && <Badge tone="indigo">{job.employmentType}</Badge>}
        {job.experienceLevel && <Badge tone="purple">{job.experienceLevel}</Badge>}
        <Badge>{job.source}</Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/jobs/${job.id}`} className={buttonStyles("secondary", "sm")}>
          View details
        </Link>
        {showTrackButton && (
          <Link to={buildTrackerUrl(job)} className={buttonStyles("primary", "sm")}>
            Add to tracker
          </Link>
        )}
        <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles("ghost", "sm")}>
          Apply <ExternalLink size={14} />
        </a>
      </div>
    </article>
  );
}
