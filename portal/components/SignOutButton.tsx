"use client"
import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-800 underline">
      Sign out
    </button>
  )
}
