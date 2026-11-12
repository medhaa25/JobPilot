import type { JobFilters } from "./types";

export const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior", "Lead"];
export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
export const JOB_SOURCES = ["LinkedIn", "Indeed", "Company site", "Wellfound"];

export const defaultJobFilters: JobFilters = {
  q: "",
  location: "",
  experienceLevel: "",
  employmentType: "",
  source: "",
  sort: "newest",
  page: 1,
  pageSize: 8,
};
