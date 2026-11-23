import bcrypt from "bcryptjs";
import { pool } from "../../db/pool.js";
import { HttpError } from "../utils/HttpError.js";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}
interface UserRow extends PublicUser {
  password_hash: string;
}

export async function verifyCredentials(email: string, password: string): Promise<PublicUser> {
  const { rows } = await pool.query<UserRow>(
    `SELECT id, name, email, password_hash FROM users WHERE lower(email) = lower($1)`,
    [email],
  );
  const user = rows[0];
  const passwordOk = user ? await bcrypt.compare(password, user.password_hash) : false;

  if (!user || !passwordOk) {
    throw new HttpError(401, "Invalid email or password");
  }
  return { id: user.id, name: user.name, email: user.email };
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const { rows } = await pool.query<PublicUser>(`SELECT id, name, email FROM users WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function createUser(name: string, email: string, password: string): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const { rows } = await pool.query<PublicUser>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email.toLowerCase(), passwordHash],
    );
    return rows[0];
  } catch (err) {
    // 23505 = Postgres "unique violation" (our unique index on lower(email))
    if (typeof err === "object" && err !== null && "code" in err && err.code === "23505") {
      throw new HttpError(409, "An account with this email already exists");
    }
    throw err;
  }
}