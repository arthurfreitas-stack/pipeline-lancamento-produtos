import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      fitScoreEntry: { select: { totalScore: true, recommendation: true } },
      phaseEntries: { orderBy: { enteredAt: "desc" }, take: 1 },
      gateDecisions: { orderBy: { decidedAt: "desc" }, take: 1 },
    },
  })

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { name, category, hypothesis, owner } = body

  if (!name || !category || !hypothesis || !owner) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const product = await prisma.$transaction(async (tx) => {
    const p = await tx.product.create({
      data: {
        name,
        category,
        hypothesis,
        owner,
        createdBy: user.id,
      },
    })
    await tx.phaseEntry.create({
      data: { productId: p.id, phaseNumber: 0 },
    })
    return p
  })

  return NextResponse.json(product, { status: 201 })
}
