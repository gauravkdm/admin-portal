import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { db } from "@/lib/prisma"

export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const interests = await db.interests.findMany({
    orderBy: { Id: "asc" },
  })

  return NextResponse.json({ data: interests })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()

  if (!body.Name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 })
  }

  const interest = await db.interests.create({
    data: {
      Name: body.Name,
      Unicode: body.Unicode || null,
    },
  })

  return NextResponse.json({ data: interest }, { status: 201 })
}
