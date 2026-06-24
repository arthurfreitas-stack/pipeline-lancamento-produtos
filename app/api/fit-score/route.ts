import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { calcFitScore } from "@/lib/pipeline-config"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { productId, axes } = body

  if (!productId || !axes) return NextResponse.json({ error: "Dados obrigatórios faltando" }, { status: 400 })

  const { score, recommendation } = calcFitScore(axes)

  const entry = await prisma.fitScoreEntry.upsert({
    where: { productId },
    create: { productId, ...axes, totalScore: score, recommendation, calculatedBy: user.id },
    update: { ...axes, totalScore: score, recommendation, calculatedBy: user.id, calculatedAt: new Date() },
  })

  await prisma.product.update({ where: { id: productId }, data: { fitScore: score } })

  return NextResponse.json(entry)
}
