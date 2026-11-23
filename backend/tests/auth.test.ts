import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { api, resetDb } from "./helpers.js";

beforeEach(resetDb);

const alice = { name: "Alice", email: "alice@example.com", password: "password123" };

describe("auth", () => {
  it("signup returns the user, sets an httpOnly cookie, and never exposes the password hash", async () => {
    const res = await request(app).post(`${api}/auth/signup`).send(alice);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: expect.any(String), name: "Alice", email: "alice@example.com" });

    const cookie = (res.get("Set-Cookie") ?? []).join(";");
    expect(cookie).toContain("token=");
    expect(cookie).toContain("HttpOnly");
  });

  it("rejects a duplicate email, ignoring letter case (409)", async () => {
    await request(app).post(`${api}/auth/signup`).send(alice);
    const res = await request(app)
      .post(`${api}/auth/signup`)
      .send({ ...alice, email: "ALICE@example.com" });

    expect(res.status).toBe(409);
  });

  it("rejects invalid signup input (400)", async () => {
    const shortPassword = await request(app).post(`${api}/auth/signup`).send({ ...alice, password: "123" });
    const noEmail = await request(app).post(`${api}/auth/signup`).send({ name: "A B", password: "password123" });

    expect(shortPassword.status).toBe(400);
    expect(noEmail.status).toBe(400);
  });

  it("gives the same 401 message for a wrong password and an unknown email", async () => {
    await request(app).post(`${api}/auth/signup`).send(alice);

    const wrongPassword = await request(app).post(`${api}/auth/login`).send({ email: alice.email, password: "nope-nope" });
    const unknownEmail = await request(app).post(`${api}/auth/login`).send({ email: "ghost@example.com", password: "password123" });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message); // doesn't reveal which emails exist
  });

  it("login -> /me works, logout -> /me is 401 again", async () => {
    await request(app).post(`${api}/auth/signup`).send(alice);

    const agent = request.agent(app); // remembers cookies
    expect((await agent.post(`${api}/auth/login`).send(alice)).status).toBe(200);

    const me = await agent.get(`${api}/auth/me`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(alice.email);

    expect((await agent.post(`${api}/auth/logout`)).status).toBe(204);
    expect((await agent.get(`${api}/auth/me`)).status).toBe(401);
  });

  it("protected routes return 401 without a cookie", async () => {
    for (const path of ["/auth/me", "/applications", "/jobs", "/analytics/overview"]) {
      const res = await request(app).get(`${api}${path}`);
      expect(res.status, path).toBe(401);
    }
  });
});