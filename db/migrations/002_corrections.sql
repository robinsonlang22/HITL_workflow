-- KTO feedback table
-- KTO requires only: (prompt, response, label:bool) — no paired comparisons needed.
-- approve  → label = true  (model preferred this response)
-- reject   → label = false (model should avoid this response)
-- edit     → label = false on original (bad), then a new row with label = true for the edited version

CREATE TABLE corrections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  prompt          TEXT NOT NULL,    -- Incoming customer email (the prompt context)
  response        TEXT NOT NULL,    -- The response being labeled (ai draft OR human edit)
  label           BOOLEAN NOT NULL, -- true = good, false = bad
  operator_email  TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_corrections_job_id ON corrections(job_id);
CREATE INDEX idx_corrections_label ON corrections(label);
