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

  const category = await db.eventCategories.update({
    where: { Id: parseInt(id) },
    data: {
      Name: body.Name,
      Description: body.Description,
      Unicode: body.Unicode,
      Color: body.Color,
    },
  })

  return NextResponse.json({ data: category })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  await db.eventCategories.delete({ where: { Id: parseInt(id) } })

  return NextResponse.json({ message: "Category deleted successfully" })
}
