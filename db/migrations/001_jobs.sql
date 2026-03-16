CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gmail_id      TEXT NOT NULL,           -- Gmail message ID (idempotency)
  from_address  TEXT NOT NULL,
  subject       TEXT NOT NULL,
  incoming_body TEXT NOT NULL,           -- Original customer email
  ai_draft      TEXT NOT NULL,           -- Claude's generated reply
  confidence    NUMERIC(4,3) NOT NULL,
  flags         JSONB DEFAULT '[]',
  resume_url    TEXT,                    -- n8n webhook URL to resume workflow
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  reviewed_by   TEXT                    -- operator Google email
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE UNIQUE INDEX idx_jobs_gmail_id ON jobs(gmail_id); -- used for ON CONFLICT in /api/jobs
