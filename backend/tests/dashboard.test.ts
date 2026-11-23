import { beforeEach, describe, expect, it } from "vitest";
import { api, resetDb, signedUpAgent } from "./helpers.js";

beforeEach(resetDb);

describe("dashboard overview", () => {
  it("is all zeros for a new user", async () => {
    const a = await signedUpAgent("a@example.com");
    const res = await a.get(`${api}/analytics/overview`);

    expect(res.body).toEqual({ totalApplications: 0, inProgress: 0, offers: 0, responseRate: 0, recentApplications: [] });
  });

  it("counts statuses and derives the response rate from the status history", async () => {
    const a = await signedUpAgent("a@example.com");
    const create = async (status: string) =>
      (await a.post(`${api}/applications`).send({ company: "Co", jobTitle: "Dev", status })).body.id as string;
    const move = (id: string, status: string) => a.patch(`${api}/applications/${id}`).send({ status });

    await create("SAVED"); // never applied
    const rejected = await create("APPLIED");
    await move(rejected, "INTERVIEW");
    await move(rejected, "REJECTED"); // got a response, then rejected: still counts as a response
    await create("APPLIED"); // in progress, no response yet
    await create("OFFER");
    await create("INTERVIEW");

    const { body } = await a.get(`${api}/analytics/overview`);

    expect(body).toMatchObject({ totalApplications: 5, inProgress: 2, offers: 1, responseRate: 75 }); // 3 of the 4 that left Saved
    expect(body.recentApplications).toHaveLength(5);
  });

  it("only counts the logged-in user's own applications", async () => {
    const a = await signedUpAgent("a@example.com");
    const b = await signedUpAgent("b@example.com");
    await a.post(`${api}/applications`).send({ company: "Co", jobTitle: "Dev", status: "OFFER" });

    expect((await b.get(`${api}/analytics/overview`)).body.totalApplications).toBe(0);
    expect((await a.get(`${api}/analytics/overview`)).body.offers).toBe(1);
  });
});