/**
 * Export KTO training data as JSONL.
 * Each line: { "prompt": "...", "completion": "...", "label": true|false }
 *
 * Usage:
 *   DATABASE_URL=postgresql://... npx ts-node scripts/export_rlhf.ts > kto_dataset.jsonl
 */
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const { rows } = await pool.query(
    `SELECT prompt, response, label FROM corrections ORDER BY created_at ASC`
  )

  for (const row of rows) {
    process.stdout.write(
      JSON.stringify({ prompt: row.prompt, completion: row.response, label: row.label }) + "\n"
    )
  }

  process.stderr.write(`Exported ${rows.length} rows.\n`)
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
