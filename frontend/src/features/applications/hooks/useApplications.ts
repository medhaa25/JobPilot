import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import type { Application, ApplicationStatus } from "@/types";
import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplicationEvents,
  // getApplicationInterviews,
  getApplications,
  updateApplication,
} from "../api/applicationsApi";
import type { ApplicationInput } from "../types";

export const useApplications = () => useQuery({ queryKey: queryKeys.applications, queryFn: getApplications });

export const useApplication = (id: string) =>
  useQuery({ queryKey: queryKeys.application(id), queryFn: () => getApplication(id), enabled: !!id });

export const useApplicationEvents = (id: string) =>
  useQuery({ queryKey: queryKeys.applicationEvents(id), queryFn: () => getApplicationEvents(id), enabled: !!id });

// export const useApplicationInterviews = (id: string) =>
//   useQuery({ queryKey: queryKeys.applicationInterviews(id), queryFn: () => getApplicationInterviews(id), enabled: !!id });

/** Everything that shows application data refreshes after a change. */
function useRefreshApplications() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.applications }),
      qc.invalidateQueries({ queryKey: ["application"] }),
      qc.invalidateQueries({ queryKey: queryKeys.dashboard }),
    ]);
}

export function useCreateApplication() {
  const refresh = useRefreshApplications();
  return useMutation({ mutationFn: createApplication, onSuccess: refresh });
}

export function useUpdateApplication() {
  const refresh = useRefreshApplications();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApplicationInput> }) => updateApplication(id, data),
    onSuccess: refresh,
  });
}

export function useDeleteApplication() {
  const refresh = useRefreshApplications();
  return useMutation({ mutationFn: deleteApplication, onSuccess: refresh });
}

/** Kanban drag-and-drop: the card moves instantly and rolls back if the request fails. */
export function useMoveApplication() {
  const qc = useQueryClient();
  const refresh = useRefreshApplications();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) => updateApplication(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: queryKeys.applications });
      const previous = qc.getQueryData<Application[]>(queryKeys.applications);
      qc.setQueryData<Application[]>(queryKeys.applications, (old) =>
        old?.map((a) => (a.id === id ? { ...a, status } : a)),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.applications, ctx.previous);
    },
    onSettled: refresh,
  });
}
