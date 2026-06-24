import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { productId, rows } = await request.json()
  if (!productId) return NextResponse.json({ error: "productId obrigatório" }, { status: 400 })

  await prisma.$transaction(async (tx) => {
    await tx.dreEntry.deleteMany({ where: { productId } })
    if (rows?.length) {
      await tx.dreEntry.createMany({
        data: rows.map((r: any, i: number) => ({
          productId,
          item: r.item || "",
          value: Number(r.value) || 0,
          percentage: r.percentage != null ? Number(r.percentage) : null,
          order: i,
          updatedBy: user.id,
        })),
      })
    }
  })

  return NextResponse.json({ ok: true })
}
