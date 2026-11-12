import type { BadgeTone } from "@/components/ui/Badge";
import type { ApplicationStatus } from "@/types";

export const STATUS_OPTIONS: Array<{ value: ApplicationStatus; label: string; tone: BadgeTone }> = [
  { value: "SAVED", label: "Saved", tone: "slate" },
  { value: "APPLIED", label: "Applied", tone: "blue" },
  { value: "ONLINE_ASSESSMENT", label: "Online Assessment", tone: "amber" },
  { value: "INTERVIEW", label: "Interview", tone: "purple" },
  { value: "OFFER", label: "Offer", tone: "green" },
  { value: "REJECTED", label: "Rejected", tone: "red" },
  { value: "WITHDRAWN", label: "Withdrawn", tone: "slate" },
];

export const statusMeta = (status: ApplicationStatus) => STATUS_OPTIONS.find((s) => s.value === status)!;
