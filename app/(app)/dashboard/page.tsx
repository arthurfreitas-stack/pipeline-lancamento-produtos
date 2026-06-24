import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { PHASES, PHASE_STATUS_LABELS } from "@/lib/pipeline-config"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const products = await prisma.product.findMany({
    include: {
      gateDecisions: { orderBy: { decidedAt: "desc" }, take: 1 },
      phaseEntries: { orderBy: { enteredAt: "asc" } },
    },
  })

  const total = products.length
  const active = products.filter((p) => p.status === "active").length
  const killed = products.filter((p) => p.status === "killed").length
  const hold = products.filter((p) => p.status === "hold").length
  const completed = products.filter((p) => p.status === "completed").length

  const byPhase = PHASES.map((p) => ({
    phase: p,
    count: products.filter((pr) => pr.status === "active" && pr.currentPhase === p.number).length,
  }))

  const killedProducts = products
    .filter((p) => p.status === "killed")
    .map((p) => ({ ...p, lastGate: p.gateDecisions[0] }))

  const holdOverdue = products.filter((p) => p.status === "hold" && p.holdUntil && new Date(p.holdUntil) < new Date())

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
      <div>
        <h1 className="text-base font-semibold mb-1" style={{ color: "var(--text)" }}>Dashboard</h1>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>VisÃƒÂ£o geral do pipeline de lanÃƒÂ§amento</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total no pipeline", value: total },
          { label: "Ativos", value: active, color: "#4ade80" },
          { label: "Invalidados", value: killed, color: "#f87171" },
          { label: "Em Hold", value: hold, color: "#60a5fa" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg p-3" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: s.color ?? "var(--text)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div>
        <h2 className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Produtos por fase (ativos)</h2>
        <div className="space-y-2">
          {byPhase.map(({ phase, count }) => (
            <div key={phase.number} className="flex items-center gap-3">
              <span className="text-xs w-28 shrink-0" style={{ color: "var(--text-muted)" }}>
                {phase.code} Ã‚Â· {PHASE_STATUS_LABELS[phase.number]}
              </span>
              <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                {count > 0 && (
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${Math.max(4, (count / Math.max(total, 1)) * 100)}%`, background: "var(--accent)" }}
                  />
                )}
              </div>
              <span className="text-xs w-4 text-right tabular-nums" style={{ color: "var(--text)" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hold overdue alert */}
      {holdOverdue.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold mb-3" style={{ color: "#f87171" }}>Ã¢Å¡Â  Hold com retomada vencida</h2>
          <div className="space-y-2">
            {holdOverdue.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm"
                style={{ background: "#f8717110", border: "1px solid #f8717140" }}
              >
                <span style={{ color: "var(--text)" }}>{p.name}</span>
                <span style={{ color: "#f87171" }} className="text-xs">
                  Retomada era {p.holdUntil ? new Date(p.holdUntil).toLocaleDateString("pt-BR") : "Ã¢â‚¬â€"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bank of learnings */}
      <div>
        <h2 className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Banco de Aprendizados Ã¢â‚¬â€ produtos invalidados</h2>
        {killedProducts.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>Nenhum produto killed ainda.</p>
        ) : (
          <div className="space-y-2">
            {killedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="block rounded-lg px-4 py-3 hover:border-white/10 transition-colors"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{p.name}</span>
                  <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                    F{p.currentPhase} Ã‚Â· {p.lastGate?.decidedAt ? new Date(p.lastGate.decidedAt).toLocaleDateString("pt-BR") : "Ã¢â‚¬â€"}
                  </span>
                </div>
                {p.lastGate?.learning && (
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{p.lastGate.learning}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
