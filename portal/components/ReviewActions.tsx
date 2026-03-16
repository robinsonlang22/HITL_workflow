"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  jobId: string
  aiDraft: string
  status: string
}

export default function ReviewActions({ jobId, aiDraft, status }: Props) {
  const [text, setText] = useState(aiDraft)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (status !== "pending") {
    return (
      <div className="text-sm text-gray-400 italic mt-2">
        This draft has already been {status}.
      </div>
    )
  }

  async function handleApprove() {
    setLoading(true)
    await fetch(`/api/jobs/${jobId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ final_text: text }),
    })
    router.push("/")
    router.refresh()
  }

  async function handleReject() {
    setLoading(true)
    await fetch(`/api/jobs/${jobId}/reject`, { method: "POST" })
    router.push("/")
    router.refresh()
  }

  const isEdited = text !== aiDraft

  return (
    <div className="space-y-4">
      <textarea
        className="w-full border border-gray-200 rounded-md p-3 text-sm font-mono resize-y min-h-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      {isEdited && (
        <p className="text-xs text-blue-600">
          Edited — original draft will be labeled false, your version labeled true (KTO).
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isEdited ? "Approve edited version" : "Approve & send"}
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  )
}
