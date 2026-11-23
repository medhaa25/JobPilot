import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createLimiter } from "../src/middleware/rateLimit.js";

// A tiny app with one fake login route and a limiter of 3 failed attempts.
// (A new app per test gives each test a fresh counter.)
function makeApp() {
  const app = express();
  app.use(express.json());
  const limiter = createLimiter({ windowMs: 60_000, limit: 3, skipSuccessfulRequests: true, enabled: true });
  app.post("/login", limiter, (req, res) => {
    res.status(req.body.password === "right" ? 200 : 401).json({});
  });
  return app;
}

const wrong = { password: "wrong" };
const right = { password: "right" };

describe("login rate limiter", () => {
  it("blocks an IP after too many failed attempts (429, with a JSON message and Retry-After)", async () => {
    const app = makeApp();

    for (let i = 0; i < 3; i++) expect((await request(app).post("/login").send(wrong)).status).toBe(401);

    const blocked = await request(app).post("/login").send(wrong);
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ message: "Too many attempts. Please try again later." });
    expect(blocked.headers["retry-after"]).toBeDefined();
  });

  it("does not count successful logins", async () => {
    const app = makeApp();

    for (let i = 0; i < 6; i++) expect((await request(app).post("/login").send(right)).status).toBe(200);

    expect((await request(app).post("/login").send(wrong)).status).toBe(401); // still not blocked
  });

  it("keeps blocking even a correct password once the limit is hit (that is the point)", async () => {
    const app = makeApp();
    for (let i = 0; i < 3; i++) await request(app).post("/login").send(wrong);

    expect((await request(app).post("/login").send(right)).status).toBe(429);
  });
});