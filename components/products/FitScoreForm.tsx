"use client"

import { useState } from "react"
import { FIT_SCORE_AXES, calcFitScore } from "@/lib/pipeline-config"

interface Props {
  productId: string
  initial: any
  readOnly: boolean
}

export default function FitScoreForm({ productId, initial, readOnly }: Props) {
  const [axes, setAxes] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const a of FIT_SCORE_AXES) init[a.key] = initial?.[a.key as keyof typeof initial] ?? 0
    return init
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(!!initial)

  const { score, recommendation } = calcFitScore(axes)

  const recColor = recommendation === "go" ? "#4ade80" : recommendation === "conditional" ? "#facc15" : "#f87171"
  const recLabel = recommendation === "go" ? "Go ≥ 60" : recommendation === "conditional" ? "Condicional 40–59" : "Kill recomendado < 40"

  async function handleSave() {
    setSaving(true)
    await fetch("/api/fit-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, axes }),
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="rounded-lg p-4 space-y-4" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Subscription-Fit Score</h3>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: recColor }}
          >
            {score}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: `${recColor}18`, color: recColor, border: `1px solid ${recColor}30` }}
          >
            {recLabel}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {FIT_SCORE_AXES.map((axis) => (
          <div key={axis.key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>
                {axis.label}
                <span className="ml-1" style={{ color: "var(--text-faint)" }}>peso {axis.weight}</span>
              </label>
              <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text)" }}>{axes[axis.key]}/5</span>
            </div>
            <p className="text-xs mb-1.5" style={{ color: "var(--text-faint)" }}>{axis.description}</p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  disabled={readOnly}
                  onClick={() => setAxes((a) => ({ ...a, [axis.key]: n }))}
                  className="flex-1 py-1 rounded text-xs font-medium transition-colors"
                  style={{
                    background: axes[axis.key] >= n && n > 0 ? `${recColor}40` : "var(--bg-hover)",
                    color: axes[axis.key] === n ? "var(--text)" : "var(--text-faint)",
                    border: axes[axis.key] === n ? `1px solid ${recColor}` : "1px solid transparent",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!readOnly && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 rounded-md text-xs font-medium disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {saving ? "Salvando..." : saved ? "Atualizar Score" : "Salvar Score"}
        </button>
      )}
    </div>
  )
}
