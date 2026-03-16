import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import pool from "@/lib/db"
import { resumeWorkflow } from "@/lib/n8n"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { final_text } = await req.json() // optional — operator-edited version
  const { id } = params

  const { rows } = await pool.query("SELECT * FROM jobs WHERE id = $1 AND status = 'pending'", [id])
  const job = rows[0]
  if (!job) return NextResponse.json({ error: "Not found or already reviewed" }, { status: 404 })

  const responseText: string = final_text?.trim() || job.ai_draft
  const wasEdited = responseText !== job.ai_draft

  // Update job
  await pool.query(
    "UPDATE jobs SET status = 'approved', reviewed_at = NOW(), reviewed_by = $1 WHERE id = $2",
    [session.user.email, id]
  )

  // KTO labels
  if (wasEdited) {
    // Original was bad → label false; human version is good → label true
    await pool.query(
      "INSERT INTO corrections (job_id, prompt, response, label, operator_email) VALUES ($1,$2,$3,$4,$5)",
      [id, job.incoming_body, job.ai_draft, false, session.user.email]
    )
    await pool.query(
      "INSERT INTO corrections (job_id, prompt, response, label, operator_email) VALUES ($1,$2,$3,$4,$5)",
      [id, job.incoming_body, responseText, true, session.user.email]
    )
  } else {
    // Approved as-is → label true
    await pool.query(
      "INSERT INTO corrections (job_id, prompt, response, label, operator_email) VALUES ($1,$2,$3,$4,$5)",
      [id, job.incoming_body, job.ai_draft, true, session.user.email]
    )
  }

  await resumeWorkflow(job.resume_url, {
    approved: true,
    final_text: responseText,
    operator: session.user.email,
  })

  return NextResponse.json({ ok: true })
}
