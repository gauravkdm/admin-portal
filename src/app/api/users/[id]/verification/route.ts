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
  const { isVerified } = body

  if (typeof isVerified !== "boolean") {
    return NextResponse.json(
      { message: "isVerified must be a boolean" },
      { status: 400 }
    )
  }

  const user = await db.users.update({
    where: { Id: id },
    data: { IsVerified: isVerified, UpdatedAt: new Date() },
    select: { Id: true, FirstName: true, LastName: true, IsVerified: true },
  })

  return NextResponse.json({ data: user })
}
