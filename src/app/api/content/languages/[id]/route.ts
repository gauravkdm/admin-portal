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

  const language = await db.languages.update({
    where: { Id: parseInt(id) },
    data: {
      Name: body.Name,
      Code: body.Code,
    },
  })

  return NextResponse.json({ data: language })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  await db.userLanguages.deleteMany({ where: { LanguagesId: parseInt(id) } })
  await db.languages.delete({ where: { Id: parseInt(id) } })

  return NextResponse.json({ message: "Language deleted successfully" })
}
