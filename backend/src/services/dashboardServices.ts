import { pool } from "../db/pool.js";
import { listApplications, type Application } from "./applicationServices.js";

export interface DashboardOverview {
  totalApplications: number;
  inProgress: number;
  offers: number;
  responseRate: number; // whole percent, 0 to 100
  recentApplications: Application[];
}

interface Counts {
  totalApplications: number;
  inProgress: number;
  offers: number;
  applied: number;
  responded: number;
}

// One pass over the user's applications. FILTER lets a single query compute several different counts.
// "applied" / "responded" look at the status history: did it ever leave SAVED / ever reach a response stage?
const COUNTS_SQL = `
  SELECT
    count(*)::int AS "totalApplications",
    count(*) FILTER (WHERE a.status IN ('APPLIED', 'ONLINE_ASSESSMENT', 'INTERVIEW'))::int AS "inProgress",
    count(*) FILTER (WHERE a.status = 'OFFER')::int AS "offers",
    count(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM application_events e
      WHERE e.application_id = a.id AND e.to_status <> 'SAVED'
    ))::int AS "applied",
    count(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM application_events e
      WHERE e.application_id = a.id AND e.to_status IN ('ONLINE_ASSESSMENT', 'INTERVIEW', 'OFFER')
    ))::int AS "responded"
  FROM applications a
  WHERE a.user_id = $1
`;

export async function getOverview(userId: string): Promise<DashboardOverview> {
  // The two queries don't depend on each other, so run them at the same time.
  const [counts, recentApplications] = await Promise.all([
    pool.query<Counts>(COUNTS_SQL, [userId]),
    listApplications(userId, 5),
  ]);

  const c = counts.rows[0];
  const responseRate = c.applied === 0 ? 0 : Math.round((c.responded / c.applied) * 100);

  return {
    totalApplications: c.totalApplications,
    inProgress: c.inProgress,
    offers: c.offers,
    responseRate,
    recentApplications,
  };
}