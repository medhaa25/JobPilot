-- CREATE TABLE users (
--   id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name          TEXT NOT NULL,
--   email         TEXT NOT NULL,
--   password_hash TEXT NOT NULL,
--   created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
-- );
CREATE UNIQUE INDEX users_email_unique ON users (lower(email));

-- CREATE TABLE jobs (
--   id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   title            TEXT NOT NULL,
--   company          TEXT NOT NULL,
--   location         TEXT,
--   description      TEXT,
--   employment_type  TEXT,
--   experience_level TEXT,
--   salary_min       INTEGER,
--   salary_max       INTEGER,
--   source           TEXT NOT NULL,
--   job_url          TEXT NOT NULL,
--   posted_at        TIMESTAMPTZ
-- );
CREATE INDEX jobs_posted_at_idx ON jobs (posted_at DESC);

CREATE TABLE saved_jobs (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id     UUID NOT NULL REFERENCES jobs(id)  ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

CREATE TYPE application_status AS ENUM
  ('SAVED','APPLIED','ONLINE_ASSESSMENT','INTERVIEW','OFFER','REJECTED','WITHDRAWN');

CREATE TABLE applications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id     UUID REFERENCES jobs(id) ON DELETE SET NULL,
  company    TEXT NOT NULL,
  job_title  TEXT NOT NULL,
  job_url    TEXT,
  status     application_status NOT NULL DEFAULT 'SAVED',
  applied_at DATE,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX applications_user_idx ON applications (user_id, status);

CREATE TABLE application_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_status    application_status,
  to_status      application_status NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX application_events_app_idx ON application_events (application_id);

CREATE TABLE interviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  round          TEXT NOT NULL,
  type           TEXT NOT NULL,
  scheduled_at   TIMESTAMPTZ NOT NULL,
  meeting_link   TEXT,
  notes          TEXT,
  completed      BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX interviews_app_idx ON interviews (application_id);

CREATE TABLE preferences (
  user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  job_titles       TEXT[] NOT NULL DEFAULT '{}',
  locations        TEXT[] NOT NULL DEFAULT '{}',
  work_mode        TEXT,
  experience_level TEXT,
  salary_min       INTEGER,
  salary_max       INTEGER
);