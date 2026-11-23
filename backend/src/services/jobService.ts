import { pool } from "../../db/pool.js";
import type { JobsQuery } from "../schemas/job.schema.js";
import { HttpError } from "../utils/HttpError.js";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  source: string;
  jobUrl: string;
  postedAt: string | null;
  isSaved: boolean;
}

// $1 is always the current user's id (used by the LEFT JOIN to compute isSaved).
const SELECT_JOB = `
  SELECT j.id, j.title, j.company, j.location, j.description,
         j.employment_type  AS "employmentType",
         j.experience_level AS "experienceLevel",
         j.salary_min       AS "salaryMin",
         j.salary_max       AS "salaryMax",
         j.source,
         j.job_url          AS "jobUrl",
         j.posted_at        AS "postedAt",
         (s.job_id IS NOT NULL) AS "isSaved"
  FROM jobs j
  LEFT JOIN saved_jobs s ON s.job_id = j.id AND s.user_id = $1
`;

// "50%" or "a_b" typed by a user must not act as LIKE wildcards.
const escapeLike = (text: string) => text.replace(/[\\%_]/g, "\\$&");

function toTsQuery(input: string): string | null {
  const words = input.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  if (words.length === 0) return null;
  return words.map((w, i) => (i === words.length - 1 ? `${w}:*` : w)).join(" & ");
}
export async function searchJobs(userId: string, query: JobsQuery) {
  const values: unknown[] = [userId];
  const conditions: string[] = [];

  // Each filter that was provided adds one condition and one value.
  const add = (sql: string, value: unknown) => {
    values.push(value);
    conditions.push(sql.replaceAll("?", `$${values.length}`));
  };

  let tsQueryParam: string | null = null;
  const tsQuery = query.q ? toTsQuery(query.q) : null;
  if (tsQuery) {
    values.push(tsQuery);
    tsQueryParam = `$${values.length}`;
    conditions.push(`j.search_vector @@ to_tsquery('english', ${tsQueryParam})`);
  }
  if (query.location) add(`j.location ILIKE ?`, `%${escapeLike(query.location)}%`);
  if (query.experienceLevel) add(`j.experience_level = ?`, query.experienceLevel);
  if (query.employmentType) add(`j.employment_type = ?`, query.employmentType);
  if (query.source) add(`j.source = ?`, query.source);
  if (query.saved) conditions.push(`s.job_id IS NOT NULL`);

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  //How many jobs match in total?
  const countResult = await pool.query<{ total: number }>(
    `SELECT count(*)::int AS total FROM jobs j
     LEFT JOIN saved_jobs s ON s.job_id = j.id AND s.user_id = $1
     ${where}`,
    values,
  );
  const total = countResult.rows[0].total;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, totalPages);

    const direction = query.sort === "oldest" ? "ASC" : "DESC";
  // "relevance" only makes sense when there is a search; otherwise fall back to newest first.
  const orderBy =
    query.sort === "relevance" && tsQueryParam
      ? `ts_rank(j.search_vector, to_tsquery('english', ${tsQueryParam})) DESC, j.posted_at DESC NULLS LAST, j.id`
      : `j.posted_at ${direction} NULLS LAST, j.id`;
  const { rows } = await pool.query<Job>(
    `${SELECT_JOB}
     ${where}
     ORDER BY ${orderBy}
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, query.pageSize, (page - 1) * query.pageSize],
  );

  return { data: rows, total, page, pageSize: query.pageSize, totalPages };
}

export async function getJob(userId: string, id: string): Promise<Job> {
  const { rows } = await pool.query<Job>(`${SELECT_JOB} WHERE j.id = $2`, [userId, id]);
  if (!rows[0]) throw new HttpError(404, "Job not found");
  return rows[0];
}

export async function saveJob(userId: string, jobId: string): Promise<void> {
  try {
    // ON CONFLICT DO NOTHING makes saving twice harmless
    await pool.query(
      `INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, jobId],
    );
  } catch (err) {
    // 23503 = foreign key violation: that job doesn't exist
    if (typeof err === "object" && err !== null && "code" in err && err.code === "23503") {
      throw new HttpError(404, "Job not found");
    }
    throw err;
  }
}

export async function unsaveJob(userId: string, jobId: string): Promise<void> {
  await pool.query(`DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2`, [userId, jobId]);
}