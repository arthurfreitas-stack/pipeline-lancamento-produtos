"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")
  const [error, setError] = useState("")
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setError("")

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setStatus("error")
    } else {
      setStatus("sent")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold" style={{ background: "var(--accent)" }}>
              P
            </div>
            <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>Pipeline allu</span>
          </div>
          <h1 className="text-xl font-semibold mb-1" style={{ color: "var(--text)" }}>Entrar</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Você receberá um link de acesso no seu email.
          </p>
        </div>

        {status === "sent" ? (
          <div className="rounded-lg p-4 text-sm" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
            <p className="font-medium mb-1" style={{ color: "var(--text)" }}>Verifique seu email</p>
            <p style={{ color: "var(--text-muted)" }}>
              Enviamos um link de acesso para <strong style={{ color: "var(--text)" }}>{email}</strong>. O link expira em 1 hora.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={status === "loading"}
              />
            </div>

            {status === "error" && (
              <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading" || !email}
              className="w-full py-2 px-4 rounded-md text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {status === "loading" ? "Enviando..." : "Enviar magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
