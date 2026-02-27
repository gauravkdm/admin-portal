import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { db } from "@/lib/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await req.json()

  const question = await db.questions.update({
    where: { Id: parseInt(id) },
    data: {
      QuestionText: body.QuestionText,
      Category: body.Category,
      IsActive: body.IsActive,
      DisplayOrder: body.DisplayOrder,
      UpdatedAt: new Date(),
    },
  })

  return NextResponse.json({ data: question })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  await db.questions.delete({ where: { Id: parseInt(id) } })

  return NextResponse.json({ message: "Question deleted successfully" })
}
