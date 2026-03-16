// Called by n8n to create a pending review job before suspending the workflow
import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { gmail_id, from_address, subject, incoming_body, ai_draft, confidence, flags, resume_url } = body

  const result = await pool.query(
    `INSERT INTO jobs (gmail_id, from_address, subject, incoming_body, ai_draft, confidence, flags, resume_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (gmail_id) DO NOTHING
     RETURNING id`,
    [gmail_id, from_address, subject, incoming_body, ai_draft, confidence, JSON.stringify(flags ?? []), resume_url]
  )

  return NextResponse.json({ id: result.rows[0]?.id ?? null })
}
