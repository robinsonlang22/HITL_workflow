// Review queue — shows all pending email drafts
import pool from "@/lib/db"
import Link from "next/link"

type Job = {
  id: string
  from_address: string
  subject: string
  confidence: string
  flags: string[]
  created_at: string
}

export const dynamic = "force-dynamic"

export default async function QueuePage() {
  const { rows } = await pool.query<Job>(
    `SELECT id, from_address, subject, confidence, flags, created_at
     FROM jobs
     WHERE status = 'pending'
     ORDER BY created_at ASC`
  )

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">
        Pending Review
        <span className="ml-2 text-sm font-normal text-gray-500">({rows.length})</span>
      </h1>

      {rows.length === 0 && (
        <p className="text-gray-400 text-sm">No drafts waiting for review.</p>
      )}

      <ul className="space-y-3">
        {rows.map((job) => (
          <li key={job.id} className="bg-white border border-gray-200 rounded-lg px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{job.subject}</p>
                <p className="text-sm text-gray-500 mt-0.5">{job.from_address}</p>
                {job.flags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.flags.map((f) => (
                      <span key={f} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <ConfidenceBadge value={parseFloat(job.confidence)} />
                <Link
                  href={`/review/${job.id}`}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Review
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = value >= 0.6 ? "text-yellow-700 bg-yellow-50" : "text-red-700 bg-red-50"
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${color}`}>
      {pct}% confidence
    </span>
  )
}
