import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { db } from "@/lib/prisma"

export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const languages = await db.languages.findMany({
    orderBy: { Id: "asc" },
  })

  return NextResponse.json({ data: languages })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()

  if (!body.Name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 })
  }

  const language = await db.languages.create({
    data: {
      Name: body.Name,
      Code: body.Code || null,
    },
  })

  return NextResponse.json({ data: language }, { status: 201 })
}
