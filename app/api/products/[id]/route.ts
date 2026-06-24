import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      gateDecisions: { orderBy: { decidedAt: "asc" } },
      phaseEntries: { orderBy: { enteredAt: "asc" } },
      blockFields: true,
      fitScoreEntry: true,
      dreEntries: { orderBy: { order: "asc" } },
      phaseNotes: true,
    },
  })

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const product = await prisma.product.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(product)
}
