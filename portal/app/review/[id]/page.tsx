import pool from "@/lib/db"
import { notFound } from "next/navigation"
import ReviewActions from "@/components/ReviewActions"

export const dynamic = "force-dynamic"

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const { rows } = await pool.query(
    "SELECT * FROM jobs WHERE id = $1",
    [params.id]
  )
  const job = rows[0]
  if (!job) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Review Draft</h1>
        <p className="text-sm text-gray-500 mt-1">
          From: <span className="font-medium">{job.from_address}</span> &mdash; {job.subject}
        </p>
      </div>

      <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-1">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
          Incoming Email
        </h2>
        <p className="text-sm whitespace-pre-wrap text-gray-700">{job.incoming_body}</p>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            AI Draft
          </h2>
          <div className="flex items-center gap-2">
            {job.flags?.length > 0 && job.flags.map((f: string) => (
              <span key={f} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                {f}
              </span>
            ))}
            <span className="text-xs font-mono text-gray-400">
              confidence: {Math.round(parseFloat(job.confidence) * 100)}%
            </span>
          </div>
        </div>

        {/* Client component handles editing + approve/reject */}
        <ReviewActions jobId={job.id} aiDraft={job.ai_draft} status={job.status} />
      </section>
    </div>
  )
}
