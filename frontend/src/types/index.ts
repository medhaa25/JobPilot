export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  employmentType: string | null;
  experienceLevel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  source: string;
  jobUrl: string;
  postedAt: string | null;
  isSaved: boolean;
}

export const APPLICATION_STATUSES = [
  "SAVED",
  "APPLIED",
  "ONLINE_ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  id: string;
  jobId: string | null;
  company: string;
  jobTitle: string;
  jobUrl: string | null;
  status: ApplicationStatus;
  appliedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  createdAt: string;
}

// export interface Interview {
//   id: string;
//   applicationId: string;
//   round: string;
//   type: string;
//   scheduledAt: string;
//   meetingLink: string | null;
//   notes: string | null;
//   completed: boolean;
// }

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
