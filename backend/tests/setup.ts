import { afterAll } from "vitest";
import { pool } from "../db/pool.js";

// Close the database connections when each test file finishes, so the process can exit.
afterAll(async () => {
  await pool.end();
});