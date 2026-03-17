-- ==============================================================================
-- AI Customer Support HITL Pipeline - Database Schema
-- Database: PostgreSQL
-- Description: Stores incoming emails, AI drafts, and human correction logs
--              for future LLM fine-tuning (RLHF/KTO).
-- ==============================================================================

-- 1. Create the main 'jobs' table for tracking email processing states
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gmail_id TEXT NOT NULL UNIQUE,
    from_address TEXT NOT NULL,
    subject TEXT NOT NULL,
    incoming_body TEXT NOT NULL,
    ai_draft TEXT NOT NULL,
    confidence NUMERIC(4,3) NOT NULL,
    flags JSONB DEFAULT '[]'::jsonb,
    resume_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by TEXT,
    
    -- Ensure status only accepts specific workflow states
    CONSTRAINT jobs_status_check CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))
);

-- Create indexes for faster querying on common lookups
CREATE INDEX IF NOT EXISTS idx_jobs_gmail_id ON public.jobs USING btree (gmail_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs USING btree (status);


-- 2. Create the 'corrections' table for building the RLHF dataset
CREATE TABLE IF NOT EXISTS public.corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    prompt TEXT NOT NULL,            -- The original customer email
    response TEXT NOT NULL,          -- The AI-generated draft
    label TEXT NOT NULL,             -- The human decision (e.g., 'approve', 'reject')
    operator_email TEXT NOT NULL,    -- Who made the decision (e.g., 'telegram-operator')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Foreign key linking back to the original job, cascades on delete
    CONSTRAINT corrections_job_id_fkey FOREIGN KEY (job_id) 
        REFERENCES public.jobs(id) ON DELETE CASCADE
);

-- Create an index to quickly find all corrections for a specific job
CREATE INDEX IF NOT EXISTS idx_corrections_job_id ON public.corrections USING btree (job_id);