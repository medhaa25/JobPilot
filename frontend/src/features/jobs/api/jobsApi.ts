import { api } from "@/lib/axios";
import type { Job, Paginated } from "@/types";
import type { JobFilters } from "../types";

//GET /jobs — pass `saved: true` to list only the user's saved jobs.
export async function getJobs(filters: JobFilters): Promise<Paginated<Job>> {
  // Empty strings and `false` mean "no filter", so don't send them.
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined && v !== false),
  );
  const { data } = await api.get<Paginated<Job>>("/jobs", { params });
  return data;
}

export async function getJob(id: string): Promise<Job> {
  const { data } = await api.get<Job>(`/jobs/${id}`);
  return data;
}

export async function saveJob(id: string): Promise<void> {
  await api.post(`/jobs/${id}/save`);
}

export async function unsaveJob(id: string): Promise<void> {
  await api.delete(`/jobs/${id}/save`);
}