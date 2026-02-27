import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { db } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (status) where.Status = status

  const [demos, total] = await Promise.all([
    db.demoRequests.findMany({
      where,
      include: {
        Users: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
            ProfilePhotoCdnUrl1: true,
          },
        },
      },
      orderBy: { CreatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.demoRequests.count({ where }),
  ])

  return NextResponse.json({
    data: demos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
