"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [form, setForm] = useState({ name: "", category: "", hypothesis: "", owner: "" })

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories)
  }, [])

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "Erro ao criar produto")
      setLoading(false)
      return
    }

    const product = await res.json()
    router.push(`/products/${product.id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-xs mb-4 flex items-center gap-1"
          style={{ color: "var(--text-muted)" }}
        >
          ← Voltar
        </button>
        <h1 className="text-base font-semibold" style={{ color: "var(--text)" }}>Novo Produto</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          O produto entra em F0 — Descoberta & Sizing automaticamente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
            Nome do produto <span style={{ color: "#f87171" }}>*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ex: Patinete Elétrico"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
            Categoria <span style={{ color: "#f87171" }}>*</span>
          </label>
          <div className="flex gap-2">
            <select value={form.category} onChange={(e) => set("category", e.target.value)} required className="flex-1">
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <a
              href="/settings"
              className="px-2.5 py-1.5 rounded-md text-xs shrink-0 flex items-center"
              style={{ background: "var(--bg-hover)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
            >
              + Gerenciar
            </a>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
            Responsável <span style={{ color: "#f87171" }}>*</span>
          </label>
          <input
            value={form.owner}
            onChange={(e) => set("owner", e.target.value)}
            placeholder="Ex: Arthur"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
            Hipótese inicial <span style={{ color: "#f87171" }}>*</span>
          </label>
          <textarea
            value={form.hypothesis}
            onChange={(e) => set("hypothesis", e.target.value)}
            placeholder="Por que esse produto faz sentido para a allu? Qual a dor que ele resolve?"
            required
            rows={4}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md text-sm"
            style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 rounded-md text-sm font-medium disabled:opacity-40"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? "Criando..." : "Criar Produto →"}
          </button>
        </div>
      </form>
    </div>
  )
}