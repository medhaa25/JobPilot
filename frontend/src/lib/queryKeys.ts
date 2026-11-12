export const queryKeys = {
  me: ["me"] as const,
  jobs: (filters: object) => ["jobs", filters] as const,
  job: (id: string) => ["job", id] as const,
  applications: ["applications"] as const,
  application: (id: string) => ["application", id] as const,
  applicationEvents: (id: string) => ["application", id, "events"] as const,
  // applicationInterviews: (id: string) => ["application", id, "interviews"] as const,
  dashboard: ["dashboard"] as const,
};
