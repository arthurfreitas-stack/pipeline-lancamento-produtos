"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { PHASES, DECISION_CONFIG } from "@/lib/pipeline-config"
import type { PhaseDef } from "@/lib/pipeline-config"
import BlockForm from "./BlockForm"
import GateModal from "@/components/pipeline/GateModal"
import FitScoreForm from "./FitScoreForm"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  killed: "Kill",
  hold: "Hold",
  completed: "Rampagem",
}

const STATUS_COLORS: Record<string, string> = {
  active: "#4ade80",
  killed: "#f87171",
  hold: "#60a5fa",
  completed: "#a78bfa",
}

interface Props {
  product: any
  userId: string
  userName: string
  phaseCompletion: Array<{ filled: number; total: number; pct: number }>
}

export default function ProductDossie({ product: initialProduct, userId, userName, phaseCompletion }: Props) {
  const router = useRouter()
  const [product, setProduct] = useState(initialProduct)
  const [activePhase, setActivePhase] = useState(product.currentPhase)
  const [showGateModal, setShowGateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"fields" | "gates" | "history">("fields")

  const currentPhaseDef = PHASES.find((p) => p.number === activePhase)!
  const isCurrentPhase = activePhase === product.currentPhase
  const isLocked = activePhase > product.currentPhase
  const isKilled = product.status === "killed"

  async function handleGateSubmit(decision: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/products/${product.id}/gate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gateNumber: product.currentPhase, decision, ...data }),
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "Erro ao registrar gate")
      return
    }

    router.refresh()
    setShowGateModal(false)
    window.location.reload()
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside
        className="w-52 shrink-0 flex flex-col h-full"
        style={{ borderRight: "1px solid var(--border)", background: "var(--bg-subtle)" }}
      >
        <div className="p-3 space-y-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <Link href="/pipeline" className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            ← Pipeline
          </Link>
          <div>
            <h2 className="text-sm font-semibold leading-snug" style={{ color: "var(--text)" }}>{product.name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}
              >
                {product.category}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: `${STATUS_COLORS[product.status]}15`, color: STATUS_COLORS[product.status] }}
              >
                {STATUS_LABELS[product.status]}
              </span>
            </div>
          </div>

          {isCurrentPhase && !isKilled && product.currentPhase < 6 && (
            <button
              onClick={() => setShowGateModal(true)}
              className="w-full py-1.5 rounded-md text-xs font-medium"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Registrar Gate {product.currentPhase}
            </button>
          )}
        </div>

        {/* Phase nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {PHASES.map((p) => {
            const comp = phaseCompletion[p.number]
            const isActive = p.number === activePhase
            const isPast = p.number < product.currentPhase
            const isCurrent = p.number === product.currentPhase
            const isFuture = p.number > product.currentPhase

            return (
              <button
                key={p.number}
                onClick={() => !isFuture && setActivePhase(p.number)}
                disabled={isFuture}
                className="w-full text-left px-2.5 py-1.5 rounded-md transition-colors"
                style={{
                  background: isActive ? "var(--bg-hover)" : "transparent",
                  color: isFuture ? "var(--text-faint)" : isActive ? "var(--text)" : "var(--text-muted)",
                  cursor: isFuture ? "not-allowed" : "pointer",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">{p.code} · {p.title.split(" ")[0]}</span>
                  {isCurrent && (
                    <span className="text-xs" style={{ color: "var(--accent)" }}>●</span>
                  )}
                  {isPast && (
                    <span className="text-xs" style={{ color: "#4ade80" }}>✓</span>
                  )}
                </div>
                {!isFuture && comp.total > 0 && (
                  <div className="mt-1 h-0.5 rounded-full" style={{ background: "var(--border)" }}>
                    <div
                      className="h-0.5 rounded-full transition-all"
                      style={{ width: `${comp.pct}%`, background: comp.pct === 100 ? "#4ade80" : "var(--accent)" }}
                    />
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Tabs */}
        <div className="p-2 space-y-0.5" style={{ borderTop: "1px solid var(--border)" }}>
          {(["gates", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setActivePhase(product.currentPhase) }}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-xs"
              style={{ color: activeTab === tab ? "var(--text)" : "var(--text-muted)", background: activeTab === tab ? "var(--bg-hover)" : "transparent" }}
            >
              {tab === "gates" ? "Gates registrados" : "Histórico"}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "gates" ? (
          <GatesTab gateDecisions={product.gateDecisions} />
        ) : activeTab === "history" ? (
          <HistoryTab productId={product.id} />
        ) : (
          <PhaseContent
            product={product}
            phase={currentPhaseDef}
            blockFields={product.blockFields}
            phaseNotes={product.phaseNotes}
            fitScoreEntry={product.fitScoreEntry}
            dreEntries={product.dreEntries}
            completion={phaseCompletion[activePhase]}
            isLocked={isLocked || isKilled}
            userId={userId}
            userName={userName}
          />
        )}
      </main>

      {showGateModal && (
        <GateModal
          product={{ ...product, gateDecisions: [], phaseEntries: [] }}
          targetColumn={`phase_${product.currentPhase + 1}`}
          onSubmit={handleGateSubmit}
          onClose={() => setShowGateModal(false)}
        />
      )}
    </div>
  )
}

function PhaseContent({ product, phase, blockFields, phaseNotes, fitScoreEntry, dreEntries, completion, isLocked, userId, userName }: any) {
  const phaseNote = phaseNotes.find((n: any) => n.phaseNumber === phase.number)
  const [note, setNote] = useState(phaseNote?.content ?? "")
  const [noteSaving, setNoteSaving] = useState(false)

  async function saveNote() {
    setNoteSaving(true)
    await fetch("/api/phase-notes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, phaseNumber: phase.number, content: note }),
    })
    setNoteSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
      {/* Phase header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
              {phase.code} — {phase.title}
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{phase.objective}</p>
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {completion.filled}/{completion.total} campos · {completion.pct}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1 rounded-full" style={{ background: "var(--border)" }}>
          <div
            className="h-1 rounded-full transition-all"
            style={{ width: `${completion.pct}%`, background: completion.pct === 100 ? "#4ade80" : "var(--accent)" }}
          />
        </div>
      </div>

      {isLocked && (
        <div className="rounded-lg px-4 py-3 text-xs" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text-muted)" }}>Esta fase ainda não foi alcançada pelo produto.</span>
        </div>
      )}

      {/* Fit Score (F1 only) */}
      {phase.number === 1 && !isLocked && (
        <FitScoreForm productId={product.id} initial={fitScoreEntry} readOnly={isLocked} />
      )}

      {/* Blocks */}
      {!isLocked && phase.blocks.map((block: any) => (
        <BlockForm
          key={block.code}
          block={block}
          productId={product.id}
          phaseNumber={phase.number}
          savedFields={blockFields.filter((f: any) => f.phaseNumber === phase.number && f.blockCode === block.code)}
          readOnly={isLocked}
          dreEntries={block.code === "G" ? dreEntries : undefined}
        />
      ))}

      {/* Notes */}
      {!isLocked && (
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
            Notas livres desta fase
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={saveNote}
            placeholder="Anotações, links, contexto adicional..."
            rows={4}
            disabled={isLocked}
          />
          <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
            {noteSaving ? "Salvando..." : "Auto-salvo ao sair do campo"}
          </p>
        </div>
      )}
    </div>
  )
}

function GatesTab({ gateDecisions }: { gateDecisions: any[] }) {
  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>Gates registrados</h2>
      {gateDecisions.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nenhum gate registrado ainda.</p>
      ) : (
        <div className="space-y-3">
          {gateDecisions.map((g: any) => {
            const cfg = DECISION_CONFIG[g.decision as keyof typeof DECISION_CONFIG]
            return (
              <div
                key={g.id}
                className="rounded-lg p-4 text-sm space-y-2"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2">
                  <span>{cfg.icon}</span>
                  <span className="font-medium" style={{ color: "var(--text)" }}>Gate {g.gateNumber} — {cfg.label}</span>
                  <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(g.decidedAt).toLocaleDateString("pt-BR")} · {g.decidedByName}
                  </span>
                </div>
                {g.observation && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{g.observation}</p>}
                {g.learning && (
                  <div className="rounded p-2 text-xs" style={{ background: "var(--bg-hover)" }}>
                    <span className="font-medium" style={{ color: "#f87171" }}>Aprendizado: </span>
                    <span style={{ color: "var(--text-muted)" }}>{g.learning}</span>
                  </div>
                )}
                {g.holdReason && (
                  <p className="text-xs" style={{ color: "#60a5fa" }}>
                    Hold até {g.holdUntil ? new Date(g.holdUntil).toLocaleDateString("pt-BR") : "—"}: {g.holdReason}
                  </p>
                )}
                {g.recycledHypothesis && (
                  <p className="text-xs" style={{ color: "#facc15" }}>Hipótese: {g.recycledHypothesis}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function HistoryTab({ productId }: { productId: string }) {
  const [history, setHistory] = useState<any[] | null>(null)
  const [loaded, setLoaded] = useState(false)

  async function load() {
    if (loaded) return
    const res = await fetch(`/api/products/${productId}/history`)
    const data = await res.json()
    setHistory(data)
    setLoaded(true)
  }

  if (!loaded) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-6">
        <button onClick={load} className="text-xs" style={{ color: "var(--accent)" }}>Carregar histórico</button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>Histórico de alterações</h2>
      {!history?.length ? (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nenhuma alteração registrada.</p>
      ) : (
        <div className="space-y-1.5">
          {history.map((h: any) => (
            <div key={h.id} className="flex items-start gap-3 text-xs py-2" style={{ borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-faint)", minWidth: 80 }}>{new Date(h.changedAt).toLocaleDateString("pt-BR")}</span>
              <span style={{ color: "var(--text-muted)", minWidth: 100 }}>{h.changedByName}</span>
              <span style={{ color: "var(--text)" }}>{h.fieldKey}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
