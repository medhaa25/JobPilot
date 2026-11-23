import { pool } from "./pool.js";

const count = Number(process.argv[2] ?? 40);
if (!Number.isInteger(count) || count < 1) {
  console.error("Usage: npm run db:seed -- <number of jobs>");
  process.exit(1);
}

const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const prefixes = ["Northwind", "Acme", "Bright", "Helio", "Quantum", "Lumen", "Orbit", "Green", "Atlas", "Pixel", "Sky", "Nimbus", "Vertex", "Cobalt", "Ember", "Summit"];
const suffixes = ["Labs", "Cloud", "Systems", "Health", "Pay", "AI", "Robotics", "Data", "Works", "Studio"];
const titles = ["Frontend Engineer", "Backend Engineer", "Full Stack Developer", "Software Engineer", "Platform Engineer", "Data Engineer", "DevOps Engineer", "Product Engineer", "Mobile Engineer", "QA Engineer", "Site Reliability Engineer", "Machine Learning Engineer"];
const teams = ["platform", "growth", "payments", "core product", "infrastructure", "developer experience"];
const locations = ["Remote", "Bengaluru", "London", "New York", "Berlin", "Toronto", "Singapore", "Sydney"];
const types = ["Full-time", "Full-time", "Full-time", "Contract", "Part-time", "Internship"];
const levels = ["Entry", "Mid", "Senior", "Lead"];
const sources = ["LinkedIn", "Indeed", "Company site", "Wellfound"];
const skills = ["React", "TypeScript", "Node.js", "PostgreSQL", "GraphQL", "Docker", "AWS", "Kubernetes", "Python", "Go", "Redis", "Tailwind CSS", "Next.js", "REST APIs", "CI/CD", "Jest"];

const DAY = 86_400_000;

function makeJob(i: number) {
  const levelIndex = randInt(0, levels.length - 1);
  const level = levels[levelIndex];
  const title = `${levelIndex >= 2 ? level + " " : ""}${pick(titles)}`;
  const company = `${pick(prefixes)} ${pick(suffixes)}`;
  const stack = [...skills].sort(() => Math.random() - 0.5).slice(0, 4);
  const hasSalary = Math.random() < 0.7;
  const salaryMin = 40_000 + levelIndex * 30_000 + randInt(0, 20) * 1_000;

  return {
    title,
    company,
    location: pick(locations),
    description:
      `${company} is hiring a ${title} to join our ${pick(teams)} team.\n\n` +
      `You will build and maintain production features end to end, review code, and work closely with design and product.\n\n` +
      `Our stack: ${stack.join(", ")}.`,
    employmentType: pick(types),
    experienceLevel: level,
    salaryMin: hasSalary ? salaryMin : null,
    salaryMax: hasSalary ? salaryMin + randInt(20, 40) * 1_000 : null,
    source: pick(sources),
    jobUrl: `https://example.com/jobs/${i + 1}`,
    postedAt: new Date(Date.now() - Math.random() * 90 * DAY).toISOString(),
  };
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // DELETE, not TRUNCATE ... CASCADE: TRUNCATE CASCADE would also wipe the applications table.
    await client.query("DELETE FROM jobs");

    const BATCH = 5_000;
    for (let start = 0; start < count; start += BATCH) {
      const size = Math.min(BATCH, count - start);
      const jobs = Array.from({ length: size }, (_, k) => makeJob(start + k));

      // unnest turns 11 arrays (one per column) into `size` rows: one INSERT per batch
      await client.query(
        `INSERT INTO jobs (title, company, location, description, employment_type, experience_level,
                           salary_min, salary_max, source, job_url, posted_at)
         SELECT * FROM unnest(
           $1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[],
           $7::int[], $8::int[], $9::text[], $10::text[], $11::timestamptz[]
         )`,
        [
          jobs.map((j) => j.title),
          jobs.map((j) => j.company),
          jobs.map((j) => j.location),
          jobs.map((j) => j.description),
          jobs.map((j) => j.employmentType),
          jobs.map((j) => j.experienceLevel),
          jobs.map((j) => j.salaryMin),
          jobs.map((j) => j.salaryMax),
          jobs.map((j) => j.source),
          jobs.map((j) => j.jobUrl),
          jobs.map((j) => j.postedAt),
        ],
      );
      console.log(`inserted ${start + size} / ${count}`);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });