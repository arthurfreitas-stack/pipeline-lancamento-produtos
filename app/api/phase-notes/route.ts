import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { productId, phaseNumber, content } = await request.json()

  const note = await prisma.phaseNote.upsert({
    where: { productId_phaseNumber: { productId, phaseNumber } },
    create: { productId, phaseNumber, content, updatedBy: user.id },
    update: { content, updatedBy: user.id },
  })

  return NextResponse.json(note)
}
