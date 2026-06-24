import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { productId, phaseNumber, blockCode, fieldKey, fieldType, value } = body

  if (!productId || !fieldKey || !fieldType) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const userName = user.email ?? user.id

  // find existing
  const existing = await prisma.blockField.findUnique({
    where: { productId_phaseNumber_blockCode_fieldKey: { productId, phaseNumber, blockCode, fieldKey } },
  })

  const valueData: Record<string, unknown> = {
    valueText: null,
    valueNumber: null,
    valueBoolean: null,
    valueDate: null,
  }

  if (fieldType === "number") valueData.valueNumber = value !== "" && value !== null ? Number(value) : null
  else if (fieldType === "checkbox") valueData.valueBoolean = Boolean(value)
  else if (fieldType === "date") valueData.valueDate = value ? new Date(value) : null
  else valueData.valueText = value ?? null

  const oldValue = existing
    ? { text: existing.valueText, number: existing.valueNumber, bool: existing.valueBoolean, date: existing.valueDate }
    : null

  const field = await prisma.blockField.upsert({
    where: { productId_phaseNumber_blockCode_fieldKey: { productId, phaseNumber, blockCode, fieldKey } },
    create: { productId, phaseNumber, blockCode, fieldKey, fieldType, ...valueData, updatedBy: user.id, updatedByName: userName },
    update: { ...valueData, updatedBy: user.id, updatedByName: userName },
  })

  // write history
  const newValue = { text: field.valueText, number: field.valueNumber, bool: field.valueBoolean, date: field.valueDate }
  await prisma.fieldHistory.create({
    data: {
      productId,
      blockFieldId: field.id,
      fieldKey,
      oldValue: oldValue ?? undefined,
      newValue,
      changedBy: user.id,
      changedByName: userName,
    },
  })

  // update product.updatedAt
  await prisma.product.update({ where: { id: productId }, data: { updatedAt: new Date() } })

  return NextResponse.json(field)
}
