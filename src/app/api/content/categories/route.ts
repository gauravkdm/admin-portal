import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { db } from "@/lib/prisma"

export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const categories = await db.eventCategories.findMany({
    orderBy: { Id: "asc" },
    include: {
      _count: { select: { EventCategoryMappings: true } },
    },
  })

  return NextResponse.json({ data: categories })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()

  if (!body.Name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 })
  }

  const category = await db.eventCategories.create({
    data: {
      Name: body.Name,
      Description: body.Description || null,
      Unicode: body.Unicode || null,
      Color: body.Color || null,
    },
  })

  return NextResponse.json({ data: category }, { status: 201 })
}
