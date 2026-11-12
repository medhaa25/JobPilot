import type { Application } from "@/types";

//  Response of GET /analytics/overview 
export interface DashboardOverview {
  totalApplications: number;
  inProgress: number;
  offers: number;
  responseRate: number; // whole percent, 0 to 100
  recentApplications: Application[];
}