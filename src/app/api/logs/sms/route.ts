import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { db } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (status) where.MessageStatus = status

  const [logs, total] = await Promise.all([
    db.sMSDeliveryLogs.findMany({
      where,
      include: {
        Countries: {
          select: { Name: true, PhoneCode: true },
        },
        SMSApplicationFeatures: {
          select: { FeatureName: true },
        },
      },
      orderBy: { DeliveryDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.sMSDeliveryLogs.count({ where }),
  ])

  return NextResponse.json({
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
