import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import type { TestProject } from "vitest/node";

// Runs once before all tests: rebuild the test database from the SQL files in /db.
export default async function setup(project: TestProject) {
  const url = String(project.config.env.DATABASE_URL);

  // Safety net: this function DROPS everything, so refuse to run on anything that isn't a test database.
  const dbName = new URL(url).pathname.slice(1);
  if (!dbName.endsWith("_test")) {
    throw new Error(`Refusing to reset "${dbName}": test database names must end with _test`);
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");

    const dir = path.join(import.meta.dirname, "..", "db");
    const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort(); // 001_..., 002_...
    for (const file of files) {
      await client.query(readFileSync(path.join(dir, file), "utf8"));
    }
  } finally {
    await client.end();
  }
}