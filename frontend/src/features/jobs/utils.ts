import type { Job } from "@/types";

/** Link to the create-application form, prefilled from a job listing. */
export function buildTrackerUrl(job: Job) {
  const params = new URLSearchParams({
    jobId: job.id,
    company: job.company,
    jobTitle: job.title,
    jobUrl: job.jobUrl,
  });
  return `/applications/new?${params.toString()}`;
}
