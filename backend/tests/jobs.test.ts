import { beforeEach, describe, expect, it } from "vitest";
import { api, insertJob, resetDb, signedUpAgent } from "./helpers.js";

beforeEach(resetDb);

const titles = (body: { data: Array<{ title: string }> }) => body.data.map((j) => j.title);

describe("job search", () => {
  it("matches words as you type, plurals, and words inside the description", async () => {
    const a = await signedUpAgent("a@example.com");
    await insertJob({ title: "Frontend Engineer", company: "Acme" });
    await insertJob({ title: "Backend Engineer", company: "Globex" });
    await insertJob({ title: "Data Scientist", description: "We run everything on Kubernetes." });

    expect(titles((await a.get(`${api}/jobs?q=fro`)).body)).toEqual(["Frontend Engineer"]); // prefix
    expect((await a.get(`${api}/jobs?q=engineers`)).body.total).toBe(2); // plural -> stem
    expect(titles((await a.get(`${api}/jobs?q=kubernetes`)).body)).toEqual(["Data Scientist"]); // description
    expect((await a.get(`${api}/jobs?q=frontend%20backend`)).body.total).toBe(0); // all words must match
  });

  it("treats search text as plain text, never as SQL", async () => {
    const a = await signedUpAgent("a@example.com");
    await insertJob();

    const res = await a.get(`${api}/jobs`).query({ q: "'; DROP TABLE jobs;--" });

    expect(res.status).toBe(200);
    expect((await a.get(`${api}/jobs`)).body.total).toBe(1); // table still there
  });

  it("'relevance' puts title matches before description-only matches", async () => {
    const a = await signedUpAgent("a@example.com");
    await insertJob({ title: "Software Engineer", description: "Work with data pipelines.", postedDaysAgo: 0 });
    await insertJob({ title: "Data Engineer", postedDaysAgo: 5 });

    const newest = await a.get(`${api}/jobs`).query({ q: "data", sort: "newest" });
    const relevance = await a.get(`${api}/jobs`).query({ q: "data", sort: "relevance" });

    expect(titles(newest.body)[0]).toBe("Software Engineer");
    expect(titles(relevance.body)[0]).toBe("Data Engineer");
  });

  it("filters, sorts and paginates, and clamps a too-high page", async () => {
    const a = await signedUpAgent("a@example.com");
    for (let i = 0; i < 5; i++) await insertJob({ title: `Job ${i}`, location: i < 3 ? "Remote" : "Berlin", postedDaysAgo: i });

    const remote = await a.get(`${api}/jobs`).query({ location: "remote", pageSize: 2 });
    expect(remote.body).toMatchObject({ total: 3, totalPages: 2, page: 1 });
    expect(titles(remote.body)).toEqual(["Job 0", "Job 1"]); // newest first

    const oldest = await a.get(`${api}/jobs`).query({ sort: "oldest", pageSize: 1 });
    expect(titles(oldest.body)).toEqual(["Job 4"]);

    const clamped = await a.get(`${api}/jobs`).query({ page: 999, pageSize: 2 });
    expect(clamped.body.page).toBe(3);

    expect((await a.get(`${api}/jobs`).query({ page: 0 })).status).toBe(400);
  });
});

describe("saved jobs", () => {
  it("are saved per user, saving twice is harmless, and unsaving works", async () => {
    const a = await signedUpAgent("a@example.com");
    const b = await signedUpAgent("b@example.com");
    const jobId = await insertJob();

    expect((await a.post(`${api}/jobs/${jobId}/save`)).status).toBe(204);
    expect((await a.post(`${api}/jobs/${jobId}/save`)).status).toBe(204); // idempotent

    expect((await a.get(`${api}/jobs/${jobId}`)).body.isSaved).toBe(true);
    expect((await b.get(`${api}/jobs/${jobId}`)).body.isSaved).toBe(false); // B has their own list
    expect((await a.get(`${api}/jobs`).query({ saved: "true" })).body.total).toBe(1);
    expect((await b.get(`${api}/jobs`).query({ saved: "true" })).body.total).toBe(0);

    expect((await a.delete(`${api}/jobs/${jobId}/save`)).status).toBe(204);
    expect((await a.get(`${api}/jobs`).query({ saved: "true" })).body.total).toBe(0);
  });

  it("returns 404 for unknown or malformed job ids", async () => {
    const a = await signedUpAgent("a@example.com");
    const ghost = "00000000-0000-4000-8000-000000000000";

    expect((await a.get(`${api}/jobs/${ghost}`)).status).toBe(404);
    expect((await a.post(`${api}/jobs/${ghost}/save`)).status).toBe(404);
    expect((await a.get(`${api}/jobs/not-a-uuid`)).status).toBe(404);
  });
});