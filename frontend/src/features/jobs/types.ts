export type JobSort = "newest" | "oldest";

export interface JobFilters {
  q: string;
  location: string;
  experienceLevel: string;
  employmentType: string;
  source: string;
  sort: JobSort;
  page: number;
  pageSize: number;
  saved?: boolean;
}
