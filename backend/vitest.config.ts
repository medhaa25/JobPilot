import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: ["./tests/globalSetup.ts"],
    setupFiles: ["./tests/setup.ts"],
    fileParallelism: false, // all test files share one database, so run them one at a time
    env: {
      NODE_ENV: "test",
      // Tests run against their own database so they never touch your development data.
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ?? "postgresql://jobpilot:jobpilot@localhost:5432/jobpilot_test",
      JWT_SECRET: "test-secret-not-for-production",
      CLIENT_URL: "http://localhost:5173",
    },
  },
});