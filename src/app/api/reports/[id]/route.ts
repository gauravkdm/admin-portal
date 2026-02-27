import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { db } from "@/lib/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await req.json()

  const report = await db.userReports.update({
    where: { Id: parseInt(id) },
    data: {
      Status: body.Status,
      AdminNotes: body.AdminNotes,
      ReviewedAt: new Date(),
      ReviewedByUserId: session!.user.id,
    },
  })

  return NextResponse.json({ data: report })
}
