export type ProductStatus = "active" | "killed" | "hold" | "completed"
export type GateDecisionType = "go" | "kill" | "recycle" | "hold"

export interface ProductCard {
  id: string
  name: string
  category: string
  status: ProductStatus
  currentPhase: number
  fitScore: number | null
  holdUntil: string | null
  holdReason: string | null
  updatedAt: string
  createdAt: string
  fitScoreEntry: { totalScore: number } | null
  gateDecisions: Array<{
    decision: GateDecisionType
    decidedAt: string
    decidedByName: string
    observation: string | null
  }>
  phaseEntries: Array<{
    phaseNumber: number
    enteredAt: string
  }>
}
