"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ProductCard } from "@/types/product"
import { PHASES, DECISION_CONFIG } from "@/lib/pipeline-config"

type Decision = "go" | "kill" | "recycle" | "hold"

interface Props {
  product: ProductCard
  targetColumn: string
  onSubmit: (decision: string, data: Record<string, unknown>) => Promise<void>
  onClose: () => void
}

export default function GateModal({ product, targetColumn, onSubmit, onClose }: Props) {
  const router = useRouter()
  const [decision, setDecision] = useState<Decision | null>(null)
  const [observation, setObservation] = useState("")
  const [learning, setLearning] = useState("")
  const [holdUntil, setHoldUntil] = useState("")
  const [holdReason, setHoldReason] = useState("")
  const [recycledHypothesis, setRecycledHypothesis] = useState("")
  const [recycledToPhase, setRecycledToPhase] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const currentPhase = PHASES.find((p) => p.number === product.currentPhase)
  const isF6 = product.currentPhase === 6

  // if targetColumn is empty it means opened from card click — redirect to dossie
  if (!targetColumn) {
    router.push(`/products/${product.id}`)
    return null
  }

  function isValid() {
    if (!decision) return false
    if (decision === "kill") return observation.trim() !== "" && learning.trim() !== ""
    if (decision === "hold") return holdUntil !== "" && holdReason.trim() !== ""
    if (decision === "recycle") return recycledHypothesis.trim() !== "" && recycledToPhase !== undefined
    return true
  }

  async function handleSubmit() {
    if (!decision || !isValid()) return
    setLoading(true)
    await onSubmit(decision, {
      observation: observation || undefined,
      learning: learning || undefined,
      holdUntil: holdUntil || undefined,
      holdReason: holdReason || undefined,
      recycledHypothesis: recycledHypothesis || undefined,
      recycledToPhase: decision === "recycle" ? recycledToPhase : undefined,
    })
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-xl p-5 space-y-4"
        style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-strong)" }}
      >
        {/* Header */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Gate {product.currentPhase} · {product.name}
              </p>
              <h2 className="text-sm font-semibold mt-0.5" style={{ color: "var(--text)" }}>
                {isF6 ? "Fase de rampagem — registro contínuo" : `"${currentPhase?.gateQuestion}"`}
              </h2>
            </div>
            <button onClick={onClose} className="text-lg leading-none" style={{ color: "var(--text-faint)" }}>×</button>
          </div>

          {/* Criteria */}
          {currentPhase && currentPhase.gateCriteria.length > 0 && (
            <ul className="mt-3 space-y-1">
              {currentPhase.gateCriteria.map((c, i) => (
                <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: "var(--text-muted)" }}>
                  <span className="mt-0.5 shrink-0">·</span> {c}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Decision buttons */}
        <div>
          <p className="text-xs mb-2 font-medium" style={{ color: "var(--text-muted)" }}>Decisão</p>
          <div className="grid grid-cols-2 gap-2">
            {(["go", "kill", "recycle", "hold"] as Decision[]).map((d) => {
              const cfg = DECISION_CONFIG[d]
              const selected = decision === d
              return (
                <button
                  key={d}
                  onClick={() => setDecision(d)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left"
                  style={{
                    border: `1px solid ${selected ? cfg.color.replace("text-", "") : "var(--border)"}`,
                    background: selected ? cfg.bg.split(" ")[0].replace("bg-", "") : "var(--bg)",
                    color: selected ? "var(--text)" : "var(--text-muted)",
                  }}
                >
                  <span>{cfg.icon}</span>
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Conditional fields */}
        {decision && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                Observação {decision === "kill" ? "(obrigatório)" : "(opcional)"}
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Contexto da decisão..."
                rows={2}
              />
            </div>

            {decision === "kill" && (
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                  Aprendizado registrado <span style={{ color: "#f87171" }}>*</span>
                </label>
                <textarea
                  value={learning}
                  onChange={(e) => setLearning(e.target.value)}
                  placeholder="O que aprendemos que não sabíamos antes? Quando reavaliar?"
                  rows={3}
                />
              </div>
            )}

            {decision === "hold" && (
              <>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                    Data de retomada <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <input type="date" value={holdUntil} onChange={(e) => setHoldUntil(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                    Motivo do Hold <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <textarea value={holdReason} onChange={(e) => setHoldReason(e.target.value)} placeholder="Ex: fornecedor sem estoque até agosto" rows={2} />
                </div>
              </>
            )}

            {decision === "recycle" && (
              <>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                    Hipótese ajustada <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <textarea
                    value={recycledHypothesis}
                    onChange={(e) => setRecycledHypothesis(e.target.value)}
                    placeholder="O que mudou? Novo fornecedor, novo público, novo plano..."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                    Retornar para fase <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <select value={recycledToPhase} onChange={(e) => setRecycledToPhase(Number(e.target.value))}>
                    {PHASES.filter((p) => p.number < product.currentPhase).map((p) => (
                      <option key={p.number} value={p.number}>
                        {p.code} — {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-md text-sm"
            style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid() || loading}
            className="flex-1 py-2 rounded-md text-sm font-medium disabled:opacity-40 transition-opacity"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? "Salvando..." : "Confirmar Decisão"}
          </button>
        </div>
      </div>
    </div>
  )
}
