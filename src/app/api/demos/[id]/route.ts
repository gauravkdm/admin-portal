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

  const demo = await db.demoRequests.update({
    where: { Id: parseInt(id) },
    data: {
      Status: body.Status,
      AdminNotes: body.AdminNotes,
      ScheduledDemoAt: body.ScheduledDemoAt
        ? new Date(body.ScheduledDemoAt)
        : undefined,
      AssignedToUserId: session!.user.id,
      UpdatedAt: new Date(),
    },
  })

  return NextResponse.json({ data: demo })
}
