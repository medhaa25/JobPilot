import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getDashboardOverview } from "../api/dashboardApi";

export const useDashboard = () => useQuery({ queryKey: queryKeys.dashboard, queryFn: getDashboardOverview });
