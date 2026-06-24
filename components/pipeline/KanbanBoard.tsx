"use client"

import { useState } from "react"
import { PHASES, PHASE_STATUS_LABELS, DECISION_CONFIG } from "@/lib/pipeline-config"
import type { ProductCard, ProductStatus } from "@/types/product"
import ProductCardComponent from "./ProductCard"
import GateModal from "./GateModal"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

const COLUMNS = [
  ...PHASES.map((p) => ({ key: `phase_${p.number}`, label: `Fase ${p.number}: ${PHASE_STATUS_LABELS[p.number]}`, phase: p.number, special: null as null | string })),
  { key: "hold", label: "Hold", phase: null, special: "hold" },
  { key: "Invalidado", label: "Invalidado", phase: null, special: "Invalidado" },
]

function getColumnKey(product: ProductCard): string {
  if (product.status === "killed") return "Invalidado"
  if (product.status === "hold") return "hold"
  return `phase_${product.currentPhase}`
}

interface GateModalState {
  product: ProductCard
  targetColumn: string
}

export default function KanbanBoard({ initialProducts, userId }: { initialProducts: ProductCard[]; userId: string }) {
  const [products, setProducts] = useState<ProductCard[]>(initialProducts)
  const [gateModal, setGateModal] = useState<GateModalState | null>(null)
  const [dragProduct, setDragProduct] = useState<ProductCard | null>(null)

  function handleDragStart(product: ProductCard) {
    if (product.status === "killed") return
    setDragProduct(product)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDrop(e: React.DragEvent, targetKey: string) {
    e.preventDefault()
    if (!dragProduct) return
    if (dragProduct.status === "killed") return
    if (getColumnKey(dragProduct) === targetKey) return

    // validate movement
    const targetCol = COLUMNS.find((c) => c.key === targetKey)
    if (!targetCol) return

    // can't go backwards without recycle; enforce via modal
    setGateModal({ product: dragProduct, targetColumn: targetKey })
    setDragProduct(null)
  }

  async function handleGateSubmit(decision: string, data: Record<string, unknown>) {
    if (!gateModal) return
    const { product } = gateModal

    const res = await fetch(`/api/products/${product.id}/gate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gateNumber: product.currentPhase,
        decision,
        ...data,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "Erro ao registrar gate")
      return
    }

    // refresh products
    const listRes = await fetch("/api/products")
    const updated = await listRes.json()
    setProducts(updated)
    setGateModal(null)
  }

  const grouped: Record<string, ProductCard[]> = {}
  for (const col of COLUMNS) grouped[col.key] = []
  for (const p of products) {
    const key = getColumnKey(p)
    if (grouped[key]) grouped[key].push(p)
  }

  return (
    <>
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-0 min-w-max">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className="flex flex-col h-full w-56 shrink-0"
              style={{ borderRight: "1px solid var(--border)" }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              {/* Column header */}
              <div
                className="px-3 py-2.5 flex items-center justify-between shrink-0"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span className="text-xs font-medium" style={{ color: col.special ? "var(--text-muted)" : "var(--text)" }}>
                  {col.label}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--bg-hover)", color: "var(--text-faint)" }}
                >
                  {grouped[col.key]?.length ?? 0}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {(grouped[col.key] ?? []).map((product) => (
                  <ProductCardComponent
                    key={product.id}
                    product={product}
                    onDragStart={() => handleDragStart(product)}
                    onClick={() => {
                      if (product.status !== "killed") {
                        setGateModal({ product, targetColumn: "" })
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {gateModal && (
        <GateModal
          product={gateModal.product}
          targetColumn={gateModal.targetColumn}
          onSubmit={handleGateSubmit}
          onClose={() => setGateModal(null)}
        />
      )}
    </>
  )
}
