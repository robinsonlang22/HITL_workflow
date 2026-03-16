# reliable_workflow

## Purpose
Email compliance pipeline. Claude drafts replies to incoming Gmail messages.
Low-confidence drafts are held for human review before sending. Every human
correction is stored as an RLHF correction pair.

## Stack
- **n8n** — already running on this GCP VM (port 5678), triggered by Gmail node
- **PostgreSQL** — draft storage + correction log (Docker, port 5432)
- **Next.js 14** — operator review portal (Docker, port 3000)
- **Claude API** — email generation (claude-sonnet-4-6)

## How it works
1. n8n Gmail node receives new email
2. n8n calls Claude API with brand-voice system prompt → gets `{ draft, confidence, flags }`
3. If `confidence >= CONFIDENCE_THRESHOLD (0.75)`: send immediately, log to DB
4. If below threshold: save draft + n8n `resumeUrl` to DB, suspend workflow
5. Operator opens portal, reviews draft, approves / edits / rejects
6. Portal POSTs decision to n8n resume webhook → workflow sends email
7. Correction pair (ai_original vs human_final) logged to `corrections` table

## Project Layout
```
reliable_workflow/
├── CLAUDE.md
├── .env.example
├── docker-compose.yml        # PostgreSQL + portal
├── prompts/
│   ├── system_brand_voice.md # Injected as Claude system prompt
│   └── email_response.md     # User-turn template
├── db/migrations/
│   ├── 001_jobs.sql
│   └── 002_corrections.sql
├── portal/                   # Next.js operator portal
│   ├── app/
│   │   ├── page.tsx          # Review queue
│   │   └── review/[id]/      # Approve / edit / reject
│   ├── lib/
│   │   ├── auth.ts           # NextAuth Google OAuth
│   │   ├── db.ts             # node-postgres client
│   │   └── n8n.ts            # Resume webhook helper
│   └── ...
├── scripts/
│   └── export_rlhf.ts        # Export corrections as JSONL for fine-tuning
└── workflows/
    └── email_hitl.json       # n8n workflow export (import via n8n UI)
```

## Dev / Deploy Commands
```bash
# Start PostgreSQL + portal
docker compose up -d

# Run DB migrations (first time)
docker compose exec postgres psql -U postgres -d reliable_workflow -f /migrations/001_jobs.sql
docker compose exec postgres psql -U postgres -d reliable_workflow -f /migrations/002_corrections.sql

# Rebuild portal after code changes
docker compose build portal && docker compose up -d portal

# Export RLHF correction pairs
npx ts-node scripts/export_rlhf.ts > corrections.jsonl
```

## Environment Variables
See `.env.example`. Copy to `.env` and fill in values. Never commit `.env`.

## n8n Credentials Needed
- Gmail OAuth2 credential
- HTTP Header Auth (for Claude API key)
- Postgres credential pointing to this VM's postgres (host: localhost, port: 5432)

## Confidence Scoring
Claude returns JSON: `{ "draft": "...", "confidence": 0.0-1.0, "flags": [] }`
Flags that lower confidence: pricing, refund, delivery_promise, legal_claim, medical

## Prompts
Edit `prompts/system_brand_voice.md` to match your company tone.
The portal reads prompts at runtime — no redeploy needed.
