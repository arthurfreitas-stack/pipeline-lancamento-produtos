import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { gateNumber, decision, observation, learning, holdUntil, holdReason, recycledHypothesis, recycledToPhase } = body

  if (!decision) return NextResponse.json({ error: "Decisão obrigatória" }, { status: 400 })
  if (decision === "kill" && !learning) return NextResponse.json({ error: "Aprendizado obrigatório para Kill" }, { status: 400 })
  if (decision === "hold" && (!holdUntil || !holdReason)) return NextResponse.json({ error: "Data de retomada e motivo obrigatórios para Hold" }, { status: 400 })
  if (decision === "recycle" && (!recycledHypothesis || recycledToPhase === undefined)) return NextResponse.json({ error: "Hipótese e fase de destino obrigatórios para Recycle" }, { status: 400 })

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
  if (product.status === "killed") return NextResponse.json({ error: "Produto killed não pode ser alterado" }, { status: 400 })

  const userName = user.email ?? user.id

  const result = await prisma.$transaction(async (tx) => {
    const gateDecision = await tx.gateDecision.create({
      data: {
        productId: id,
        gateNumber,
        decision,
        observation,
        learning,
        holdUntil: holdUntil ? new Date(holdUntil) : null,
        holdReason,
        recycledHypothesis,
        recycledToPhase,
        decidedBy: user.id,
        decidedByName: userName,
      },
    })

    // close current phase entry
    await tx.phaseEntry.updateMany({
      where: { productId: id, phaseNumber: product.currentPhase, exitedAt: null },
      data: { exitedAt: new Date(), gateDecisionId: gateDecision.id },
    })

    let newStatus = product.status
    let newPhase = product.currentPhase

    if (decision === "go") {
      newPhase = product.currentPhase + 1
      newStatus = newPhase === 6 ? "completed" : "active"
      await tx.phaseEntry.create({ data: { productId: id, phaseNumber: newPhase } })
    } else if (decision === "kill") {
      newStatus = "killed"
    } else if (decision === "hold") {
      newStatus = "hold"
    } else if (decision === "recycle") {
      newPhase = recycledToPhase
      newStatus = "active"
      await tx.phaseEntry.create({ data: { productId: id, phaseNumber: newPhase } })
    }

    await tx.product.update({
      where: { id },
      data: {
        currentPhase: newPhase,
        status: newStatus,
        holdUntil: decision === "hold" ? new Date(holdUntil) : decision === "go" || decision === "recycle" ? null : undefined,
        holdReason: decision === "hold" ? holdReason : decision === "go" || decision === "recycle" ? null : undefined,
      },
    })

    return gateDecision
  })

  return NextResponse.json(result, { status: 201 })
}
