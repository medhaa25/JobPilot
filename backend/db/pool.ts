import { Pool } from "pg";
import { env } from "../src/config/env.js";

export const pool = new Pool({ connectionString: env.DATABASE_URL });
