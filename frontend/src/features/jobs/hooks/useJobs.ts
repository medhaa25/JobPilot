import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getJob, getJobs, saveJob, unsaveJob } from "../api/jobsApi";
import type { JobFilters } from "../types";

export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: queryKeys.jobs(filters),
    queryFn: () => getJobs(filters),
    placeholderData: keepPreviousData,
  });
}

export function useJob(id: string) {
  return useQuery({ queryKey: queryKeys.job(id), queryFn: () => getJob(id), enabled: !!id });
}

export function useToggleSaveJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) => (saved ? unsaveJob(id) : saveJob(id)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["jobs"] });
      void qc.invalidateQueries({ queryKey: ["job"] });
    },
  });
}
