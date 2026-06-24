import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_CATEGORIES } from "@/lib/pipeline-config"

export async function GET() {
  let categories = await prisma.category.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] })

  if (categories.length === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((name, i) => ({ name, order: i })),
      skipDuplicates: true,
    })
    categories = await prisma.category.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
  }

  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })

  const count = await prisma.category.count()
  const category = await prisma.category.create({ data: { name: name.trim(), order: count } })
  return NextResponse.json(category, { status: 201 })
}