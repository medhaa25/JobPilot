import { Badge } from "@/components/ui/Badge";
import type { ApplicationStatus } from "@/types";
import { statusMeta } from "../constants";

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, tone } = statusMeta(status);
  return <Badge tone={tone}>{label}</Badge>;
}
