import { beforeEach, describe, expect, it } from "vitest";
import { api, resetDb, signedUpAgent } from "./helpers.js";

beforeEach(resetDb);

describe("applications", () => {
  it("creates an application with camelCase fields, a default status and a plain date", async () => {
    const a = await signedUpAgent("a@example.com");

    const res = await a.post(`${api}/applications`).send({ company: "Acme", jobTitle: "Dev", appliedAt: "2026-11-04" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      company: "Acme",
      jobTitle: "Dev",
      status: "SAVED",
      appliedAt: "2026-11-04", // a plain string, not a timezone-shifted timestamp
      jobUrl: null,
      notes: null,
    });
  });

  it("rejects bad input (400) and malformed ids (404)", async () => {
    const a = await signedUpAgent("a@example.com");

    expect((await a.post(`${api}/applications`).send({ company: "", jobTitle: "Dev" })).status).toBe(400);
    expect((await a.post(`${api}/applications`).send({ company: "X", jobTitle: "Y", status: "NOPE" })).status).toBe(400);
    expect((await a.get(`${api}/applications/not-a-uuid`)).status).toBe(404);
  });

  it("rejects an application linked to a job that doesn't exist (400)", async () => {
    const a = await signedUpAgent("a@example.com");
    const res = await a
      .post(`${api}/applications`)
      .send({ company: "X", jobTitle: "Y", jobId: "00000000-0000-4000-8000-000000000000" });

    expect(res.status).toBe(400);
  });

  it("user B cannot read, change, delete or see the history of user A's application", async () => {
    const a = await signedUpAgent("a@example.com");
    const b = await signedUpAgent("b@example.com");
    const { body: created } = await a.post(`${api}/applications`).send({ company: "Acme", jobTitle: "Dev" });
    const url = `${api}/applications/${created.id}`;

    expect((await b.get(url)).status).toBe(404);
    expect((await b.patch(url).send({ status: "OFFER" })).status).toBe(404);
    expect((await b.get(`${url}/events`)).status).toBe(404);
    expect((await b.delete(url)).status).toBe(404);
    expect((await b.get(`${api}/applications`)).body).toEqual([]);

    // ...and A's application is untouched
    const after = await a.get(url);
    expect(after.status).toBe(200);
    expect(after.body.status).toBe("SAVED");
  });

  it("records a status-history entry for creation and for every status change", async () => {
    const a = await signedUpAgent("a@example.com");
    const { body: app } = await a.post(`${api}/applications`).send({ company: "Acme", jobTitle: "Dev" });

    await a.patch(`${api}/applications/${app.id}`).send({ status: "APPLIED" });
    await a.patch(`${api}/applications/${app.id}`).send({ status: "APPLIED" }); // no change -> no new entry

    const { body: events } = await a.get(`${api}/applications/${app.id}/events`);
    expect(events.map((e: { fromStatus: string | null; toStatus: string }) => [e.fromStatus, e.toStatus])).toEqual([
      ["SAVED", "APPLIED"], // newest first
      [null, "SAVED"],
    ]);
  });

  it("a partial update changes only the fields it sends", async () => {
    const a = await signedUpAgent("a@example.com");
    const { body: app } = await a
      .post(`${api}/applications`)
      .send({ company: "Acme", jobTitle: "Dev", status: "APPLIED" });

    const res = await a.patch(`${api}/applications/${app.id}`).send({ notes: "Referral from Sam" });

    expect(res.body.notes).toBe("Referral from Sam");
    expect(res.body.status).toBe("APPLIED"); // must NOT be reset to the default
    expect(res.body.company).toBe("Acme");
  });

  it("deletes an application and its history", async () => {
    const a = await signedUpAgent("a@example.com");
    const { body: app } = await a.post(`${api}/applications`).send({ company: "Acme", jobTitle: "Dev" });

    expect((await a.delete(`${api}/applications/${app.id}`)).status).toBe(204);
    expect((await a.get(`${api}/applications/${app.id}`)).status).toBe(404);
  });
});