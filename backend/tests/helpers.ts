import request from "supertest";
import { expect } from "vitest";
import { app } from "../src/app.js";
import { pool } from "../db/pool.js";

export const api = "/api/v1";

/** Empty the tables before each test so tests can't affect each other. */
export async function resetDb() {
  await pool.query("TRUNCATE users, jobs CASCADE");
}

/** A supertest "agent" remembers cookies between requests, just like a browser. */
export async function signedUpAgent(email: string, name = "Test User") {
  const agent = request.agent(app);
  const res = await agent.post(`${api}/auth/signup`).send({ name, email, password: "password123" });
  expect(res.status).toBe(201);
  return agent;
}

interface JobOverrides {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  postedDaysAgo?: number;
}

/** Insert a job straight into the database and return its id. */
export async function insertJob(o: JobOverrides = {}) {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO jobs (title, company, location, description, source, job_url, posted_at)
     VALUES ($1, $2, $3, $4, 'Test', 'https://example.com/job', now() - make_interval(days => $5::int))
     RETURNING id`,
    [
      o.title ?? "Software Engineer",
      o.company ?? "Acme",
      o.location ?? "Remote",
      o.description ?? "Build things.",
      o.postedDaysAgo ?? 0,
    ],
  );
  return rows[0].id;
}