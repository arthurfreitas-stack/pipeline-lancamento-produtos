"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ProductCard } from "@/types/product"
import { DECISION_CONFIG } from "@/lib/pipeline-config"

interface Props {
  product: ProductCard
  onDragStart: () => void
  onClick: () => void
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 60 ? "#4ade80" : score >= 40 ? "#facc15" : "#f87171"
  return (
    <span
      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
    >
      {score}
    </span>
  )
}

export default function ProductCard({ product, onDragStart, onClick }: Props) {
  const lastGate = product.gateDecisions?.[0]
  const lastEntry = product.phaseEntries?.[0]
  const isKilled = product.status === "killed"
  const isHold = product.status === "hold"

  const holdDate = product.holdUntil ? new Date(product.holdUntil) : null
  const holdOverdue = holdDate && holdDate < new Date()

  return (
    <div
      draggable={!isKilled}
      onDragStart={onDragStart}
      className="rounded-md p-3 text-xs space-y-2 transition-colors"
      style={{
        background: "var(--bg-subtle)",
        border: `1px solid ${holdOverdue ? "#f87171" : "var(--border)"}`,
        opacity: isKilled ? 0.6 : 1,
        cursor: isKilled ? "default" : "grab",
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <Link
          href={`/products/${product.id}`}
          className="font-medium leading-snug hover:underline"
          style={{ color: "var(--text)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {product.name}
        </Link>
        {product.fitScore !== null && <ScoreBadge score={product.fitScore} />}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="px-1.5 py-0.5 rounded text-xs"
          style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}
        >
          {product.category}
        </span>
        {isHold && (
          <span
            className="px-1.5 py-0.5 rounded text-xs"
            style={{ background: holdOverdue ? "#f8717118" : "#60a5fa18", color: holdOverdue ? "#f87171" : "#60a5fa" }}
          >
            ⏸ {holdDate ? holdDate.toLocaleDateString("pt-BR") : ""}
          </span>
        )}
      </div>

      {lastEntry && (
        <p style={{ color: "var(--text-faint)" }}>
          há {formatDistanceToNow(new Date(lastEntry.enteredAt), { locale: ptBR })} na fase
        </p>
      )}

      {lastGate && (
        <p style={{ color: "var(--text-faint)" }}>
          Gate {lastGate.decision in DECISION_CONFIG ? DECISION_CONFIG[lastGate.decision as keyof typeof DECISION_CONFIG].icon : ""}{" "}
          {formatDistanceToNow(new Date(lastGate.decidedAt), { locale: ptBR, addSuffix: true })}
        </p>
      )}
    </div>
  )
}
