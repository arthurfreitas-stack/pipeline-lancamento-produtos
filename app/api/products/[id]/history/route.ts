import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const history = await prisma.fieldHistory.findMany({
    where: { productId: id },
    orderBy: { changedAt: "desc" },
    take: 100,
  })

  return NextResponse.json(history)
}
