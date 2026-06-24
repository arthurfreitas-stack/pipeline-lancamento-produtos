import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import KanbanBoard from "@/components/pipeline/KanbanBoard"

export const dynamic = "force-dynamic"

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      fitScoreEntry: { select: { totalScore: true } },
      gateDecisions: { orderBy: { decidedAt: "desc" }, take: 1 },
      phaseEntries: { orderBy: { enteredAt: "desc" }, take: 1 },
    },
  })

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h1 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Pipeline</h1>
        <Link
          href="/products/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <span>+</span> Novo Produto
        </Link>
      </div>
      <KanbanBoard initialProducts={JSON.parse(JSON.stringify(products))} userId={user.id} />
    </div>
  )
}
