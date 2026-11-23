-- A column Postgres keeps up to date by itself: the searchable "word index" of each job.
-- Title words weigh most (A), then company (B), then description (C).
ALTER TABLE jobs ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')),       'A') ||
    setweight(to_tsvector('english', coalesce(company, '')),     'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) STORED;

-- GIN index: word -> list of rows containing it (like the index at the back of a book)
CREATE INDEX jobs_search_idx ON jobs USING GIN (search_vector);