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

  const interest = await db.interests.update({
    where: { Id: parseInt(id) },
    data: {
      Name: body.Name,
      Unicode: body.Unicode,
    },
  })

  return NextResponse.json({ data: interest })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  await db.userInterests.deleteMany({ where: { InterestsId: parseInt(id) } })
  await db.interests.delete({ where: { Id: parseInt(id) } })

  return NextResponse.json({ message: "Interest deleted successfully" })
}
