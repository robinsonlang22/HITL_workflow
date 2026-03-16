export async function resumeWorkflow(
  resumeUrl: string,
  payload: { approved: boolean; final_text?: string; operator: string }
) {
  const res = await fetch(resumeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`n8n resume failed: ${res.status} ${await res.text()}`)
  }
}
