import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const { rows } = await pool.query("SELECT now() AS time, count(*) AS users FROM users");
console.log(rows[0]);
await pool.end();