import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { PHASES, getPhaseCompletionRate } from "@/lib/pipeline-config"
import ProductDossie from "@/components/products/ProductDossie"

export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

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

  if (!product) notFound()

  // compute completion per phase
  const phaseCompletion = PHASES.map((p) => {
    const phaseFields = product.blockFields.filter((f) => f.phaseNumber === p.number)
    return getPhaseCompletionRate(phaseFields, p)
  })

  return (
    <ProductDossie
      product={JSON.parse(JSON.stringify(product))}
      userId={user.id}
      userName={user.email ?? user.id}
      phaseCompletion={phaseCompletion}
    />
  )
}
