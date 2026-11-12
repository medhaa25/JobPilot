import { api } from "@/lib/axios";
import type { DashboardOverview } from "../types";

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { data } = await api.get<DashboardOverview>("/analytics/overview");
  return data;
}