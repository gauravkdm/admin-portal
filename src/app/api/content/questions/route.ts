import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { db } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = req.nextUrl
  const category = searchParams.get("category")
  const active = searchParams.get("active")

  const where: Record<string, unknown> = {}
  if (category) where.Category = category
  if (active === "true") where.IsActive = true
  if (active === "false") where.IsActive = false

  const questions = await db.questions.findMany({
    where,
    orderBy: { DisplayOrder: "asc" },
  })

  return NextResponse.json({ data: questions })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()

  if (!body.QuestionText) {
    return NextResponse.json(
      { message: "QuestionText is required" },
      { status: 400 }
    )
  }

  const maxOrder = await db.questions.aggregate({
    _max: { DisplayOrder: true },
  })

  const question = await db.questions.create({
    data: {
      QuestionText: body.QuestionText,
      Category: body.Category || null,
      IsActive: body.IsActive ?? true,
      DisplayOrder: body.DisplayOrder ?? (maxOrder._max.DisplayOrder || 0) + 1,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  })

  return NextResponse.json({ data: question }, { status: 201 })
}
