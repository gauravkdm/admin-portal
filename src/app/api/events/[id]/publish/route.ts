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
  const { isPublished } = body

  if (typeof isPublished !== "boolean") {
    return NextResponse.json(
      { message: "isPublished must be a boolean" },
      { status: 400 }
    )
  }

  const event = await db.events.update({
    where: { Id: id },
    data: { IsPublished: isPublished, UpdatedAt: new Date() },
    select: { Id: true, Title: true, IsPublished: true },
  })

  return NextResponse.json({ data: event })
}
