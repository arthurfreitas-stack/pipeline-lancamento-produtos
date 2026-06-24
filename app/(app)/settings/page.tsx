"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  order: number
}

export default function SettingsPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories)
  }, [])

  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCategory.trim()) return
    setLoading(true)
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory.trim() }),
    })
    if (res.ok) {
      const cat = await res.json()
      setCategories((prev) => [...prev, cat])
      setNewCategory("")
    } else {
      const err = await res.json()
      alert(err.error || "Erro ao criar categoria")
    }
    setLoading(false)
  }

  async function deleteCategory(id: string) {
    if (!confirm("Excluir esta categoria?")) return
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-8 space-y-8">
      <div>
        <button
          onClick={() => router.back()}
          className="text-xs mb-4 flex items-center gap-1"
          style={{ color: "var(--text-muted)" }}
        >
          ← Voltar
        </button>
        <h1 className="text-base font-semibold" style={{ color: "var(--text)" }}>Configurações</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Gerencie categorias e opções do pipeline.</p>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>Categorias de produto</h2>

        <div className="rounded-lg overflow-hidden mb-3" style={{ border: "1px solid var(--border)" }}>
          {categories.length === 0 ? (
            <p className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>Nenhuma categoria. Adicione abaixo.</p>
          ) : (
            categories.map((cat, i) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none", background: "var(--bg-subtle)" }}
              >
                <span className="text-sm" style={{ color: "var(--text)" }}>{cat.name}</span>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{ color: "var(--text-faint)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
                >
                  Excluir
                </button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={addCategory} className="flex gap-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nome da nova categoria..."
            className="flex-1"
          />
          <button
            type="submit"
            disabled={loading || !newCategory.trim()}
            className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-40 shrink-0"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? "..." : "Adicionar"}
          </button>
        </form>
      </div>
    </div>
  )
}