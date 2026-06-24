"use client"

import { useState, useCallback, useRef } from "react"
import type { BlockDef, FieldDef } from "@/lib/pipeline-config"

interface Props {
  block: BlockDef
  productId: string
  phaseNumber: number
  savedFields: Array<{ fieldKey: string; valueText?: string | null; valueNumber?: number | null; valueBoolean?: boolean | null; valueDate?: string | null }>
  readOnly: boolean
  dreEntries?: any[]
}

function getInitialValue(field: FieldDef, saved: Props["savedFields"]) {
  const f = saved.find((s) => s.fieldKey === field.key)
  if (!f) return field.type === "checkbox" ? false : ""
  if (field.type === "checkbox") return f.valueBoolean ?? false
  if (field.type === "number") return f.valueNumber?.toString() ?? ""
  if (field.type === "date") return f.valueDate ? f.valueDate.split("T")[0] : ""
  return f.valueText ?? ""
}

export default function BlockForm({ block, productId, phaseNumber, savedFields, readOnly, dreEntries }: Props) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const init: Record<string, string | boolean> = {}
    for (const f of block.fields) init[f.key] = getInitialValue(f, savedFields)
    return init
  })
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const filledCount = block.fields.filter((f) => {
    const v = values[f.key]
    if (f.type === "checkbox") return v === true
    return v !== "" && v !== undefined && v !== null
  }).length

  async function saveField(fieldKey: string, fieldType: string, value: unknown) {
    setSaving((s) => ({ ...s, [fieldKey]: true }))
    await fetch("/api/blocks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, phaseNumber, blockCode: block.code, fieldKey, fieldType, value }),
    })
    setSaving((s) => ({ ...s, [fieldKey]: false }))
  }

  function handleChange(field: FieldDef, value: string | boolean) {
    setValues((v) => ({ ...v, [field.key]: value }))
    if (readOnly) return

    if (field.type === "checkbox") {
      saveField(field.key, field.type, value)
      return
    }

    clearTimeout(timers.current[field.key])
    timers.current[field.key] = setTimeout(() => saveField(field.key, field.type, value), 1500)
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors"
        style={{ background: "var(--bg-subtle)" }}
      >
        <span style={{ color: "var(--text)" }}>Bloco {block.code} — {block.title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {filledCount}/{block.fields.length}
          </span>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-4" style={{ background: "var(--bg)" }}>
          {block.fields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={(v) => handleChange(field, v)}
              saving={saving[field.key]}
              readOnly={readOnly}
            />
          ))}

          {/* DRE table for block G */}
          {block.code === "G" && dreEntries !== undefined && (
            <DreTable productId={productId} entries={dreEntries} readOnly={readOnly} />
          )}
        </div>
      )}
    </div>
  )
}

function FieldInput({ field, value, onChange, saving, readOnly }: { field: FieldDef; value: string | boolean; onChange: (v: string | boolean) => void; saving?: boolean; readOnly: boolean }) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
          disabled={readOnly}
          className="w-4 h-4 rounded"
          style={{ width: "auto", padding: 0 }}
        />
        <span className="text-sm" style={{ color: "var(--text)" }}>{field.label}</span>
        {saving && <span className="text-xs" style={{ color: "var(--text-faint)" }}>•</span>}
      </label>
    )
  }

  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
        {field.label}
        {saving && <span className="ml-2" style={{ color: "var(--text-faint)" }}>salvando...</span>}
      </label>

      {field.type === "select" && (
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
        >
          <option value="">Selecione...</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      {field.type === "select_multi" && (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((o) => {
            const selected = (value as string).includes(o)
            return (
              <button
                key={o}
                type="button"
                disabled={readOnly}
                onClick={() => {
                  const arr = (value as string).split(",").filter(Boolean)
                  const next = selected ? arr.filter((x) => x !== o) : [...arr, o]
                  onChange(next.join(","))
                }}
                className="px-2.5 py-1 rounded text-xs"
                style={{
                  background: selected ? "var(--accent)" : "var(--bg-hover)",
                  color: selected ? "#fff" : "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {o}
              </button>
            )
          })}
        </div>
      )}

      {field.type === "textarea" && (
        <textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={readOnly}
          rows={3}
        />
      )}

      {field.type === "number" && (
        <input
          type="number"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={readOnly}
          step="any"
        />
      )}

      {field.type === "date" && (
        <input
          type="date"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
        />
      )}

      {(field.type === "text") && (
        <input
          type="text"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={readOnly}
        />
      )}
    </div>
  )
}

function DreTable({ productId, entries, readOnly }: { productId: string; entries: any[]; readOnly: boolean }) {
  const [rows, setRows] = useState<any[]>(entries.length > 0 ? entries : [{ item: "", value: 0, percentage: null }])
  const [saving, setSaving] = useState(false)

  async function saveRows(updated: any[]) {
    setSaving(true)
    await fetch(`/api/dre`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rows: updated }),
    })
    setSaving(false)
  }

  function update(i: number, key: string, val: string) {
    const updated = rows.map((r, idx) => idx === i ? { ...r, [key]: key === "item" ? val : Number(val) } : r)
    setRows(updated)
    saveRows(updated)
  }

  function addRow() {
    setRows((r) => [...r, { item: "", value: 0, percentage: null }])
  }

  function removeRow(i: number) {
    const updated = rows.filter((_, idx) => idx !== i)
    setRows(updated)
    saveRows(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          DRE / Unit Economics {saving && <span style={{ color: "var(--text-faint)" }}>salvando...</span>}
        </label>
        {!readOnly && (
          <button onClick={addRow} className="text-xs" style={{ color: "var(--accent)" }}>+ Linha</button>
        )}
      </div>
      <div className="rounded-md overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="grid grid-cols-12 px-3 py-2 text-xs font-medium" style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>
          <span className="col-span-6">Item</span>
          <span className="col-span-3">Valor (R$)</span>
          <span className="col-span-2">%</span>
          <span className="col-span-1" />
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-12 items-center px-2 py-1.5 gap-1" style={{ borderTop: "1px solid var(--border)" }}>
            <input className="col-span-6 text-xs" style={{ border: "none", background: "transparent", padding: "2px 4px" }} value={row.item} onChange={(e) => update(i, "item", e.target.value)} disabled={readOnly} placeholder="Ex: Yield bruto" />
            <input className="col-span-3 text-xs" type="number" style={{ border: "none", background: "transparent", padding: "2px 4px" }} value={row.value} onChange={(e) => update(i, "value", e.target.value)} disabled={readOnly} />
            <input className="col-span-2 text-xs" type="number" style={{ border: "none", background: "transparent", padding: "2px 4px" }} value={row.percentage ?? ""} onChange={(e) => update(i, "percentage", e.target.value)} disabled={readOnly} placeholder="%" />
            {!readOnly && (
              <button onClick={() => removeRow(i)} className="col-span-1 text-center text-xs" style={{ color: "var(--text-faint)" }}>×</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
