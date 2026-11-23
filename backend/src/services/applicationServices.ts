import { pool } from "../../db/pool.js";
import type {
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "../schemas/application.schema.js";
import { HttpError } from "../utils/HttpError.js";
import { isPgError } from "../utils/pgError.js";
// Column list with the aliases that turn snake_case into the camelCase the frontend expects.
// to_char makes applied_at a plain "2026-11-04" string (no timezone surprises).
const COLUMNS = `
  id,
  job_id AS "jobId",
  company,
  job_title AS "jobTitle",
  job_url AS "jobUrl",
  status,
  to_char(applied_at, 'YYYY-MM-DD') AS "appliedAt",
  notes,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

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

export async function listApplications(userId: string, limit?: number): Promise<Application[]> {
  const { rows } = await pool.query<Application>(
    `SELECT ${COLUMNS} FROM applications WHERE user_id = $1 ORDER BY updated_at DESC LIMIT $2`,
    [userId, limit ?? null],
  );
  return rows;
}

export async function getApplication(userId: string, id: string): Promise<Application> {
  const { rows } = await pool.query<Application>(
    `SELECT ${COLUMNS} FROM applications WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  if (!rows[0]) throw new HttpError(404, "Application not found");
  return rows[0];
}

export async function createApplication(userId: string, input: CreateApplicationInput): Promise<Application> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<Application>(
      `INSERT INTO applications (user_id, job_id, company, job_title, job_url, status, applied_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${COLUMNS}`,
      [
        userId,
        input.jobId ?? null,
        input.company,
        input.jobTitle,
        input.jobUrl ?? null,
        input.status,
        input.appliedAt ?? null,
        input.notes ?? null,
      ],
    );
    const app = rows[0];

    // First entry of the status history
    await client.query(
      `INSERT INTO application_events (application_id, from_status, to_status) VALUES ($1, NULL, $2)`,
      [app.id, app.status],
    );

    await client.query("COMMIT");
    return app;
    } catch (err) {
    await client.query("ROLLBACK");
    if (isPgError(err, "23503")) throw new HttpError(400, "That job no longer exists");
    throw err;
  } finally {
    client.release();
  }
  
}

// Only these fields may be changed through PATCH. Keys are what the frontend sends, values are column names.
const UPDATABLE_COLUMNS = {
  company: "company",
  jobTitle: "job_title",
  jobUrl: "job_url",
  status: "status",
  appliedAt: "applied_at",
  notes: "notes",
} as const;

export async function updateApplication(
  userId: string,
  id: string,
  input: UpdateApplicationInput,
): Promise<Application> {
  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [field, column] of Object.entries(UPDATABLE_COLUMNS)) {
    const value = input[field as keyof UpdateApplicationInput];
    if (value !== undefined) {
      values.push(value);
      sets.push(`${column} = $${values.length}`);
    }
  }

  if (sets.length === 0) return getApplication(userId, id); // nothing to change

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // FOR UPDATE locks the row so two requests can't change it at the same moment
    const current = await client.query<{ status: ApplicationStatus }>(
      `SELECT status FROM applications WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [id, userId],
    );
    if (!current.rows[0]) throw new HttpError(404, "Application not found");

    values.push(id, userId);
    const { rows } = await client.query<Application>(
      `UPDATE applications
       SET ${sets.join(", ")}, updated_at = now()
       WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING ${COLUMNS}`,
      values,
    );

    if (input.status && input.status !== current.rows[0].status) {
      await client.query(
        `INSERT INTO application_events (application_id, from_status, to_status) VALUES ($1, $2, $3)`,
        [id, current.rows[0].status, input.status],
      );
    }

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteApplication(userId: string, id: string): Promise<void> {
  const result = await pool.query(`DELETE FROM applications WHERE id = $1 AND user_id = $2`, [id, userId]);
  if (result.rowCount === 0) throw new HttpError(404, "Application not found");
}

export async function listApplicationEvents(userId: string, id: string): Promise<ApplicationEvent[]> {
  await getApplication(userId, id); // 404 if it isn't yours
  const { rows } = await pool.query<ApplicationEvent>(
    `SELECT id,
            application_id AS "applicationId",
            from_status AS "fromStatus",
            to_status AS "toStatus",
            created_at AS "createdAt"
     FROM application_events
     WHERE application_id = $1
     ORDER BY created_at DESC`,
    [id],
  );
  return rows;
}