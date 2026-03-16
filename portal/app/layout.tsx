import type { Metadata } from "next"
import "./globals.css"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SignOutButton from "@/components/SignOutButton"

export const metadata: Metadata = { title: "reliable_workflow — Review Portal" }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <span className="font-semibold tracking-tight">reliable_workflow</span>
          {session?.user?.email && (
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{session.user.email}</span>
              <SignOutButton />
            </div>
          )}
        </header>
        <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
