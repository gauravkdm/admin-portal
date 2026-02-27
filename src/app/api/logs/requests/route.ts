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
  const method = searchParams.get("method")
  const statusCode = searchParams.get("statusCode")

  const where: Record<string, unknown> = {}
  if (method) where.HttpMethod = method
  if (statusCode) where.StatusCode = parseInt(statusCode)

  const [logs, total] = await Promise.all([
    db.requestLogs.findMany({
      where,
      orderBy: { Timestamp: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.requestLogs.count({ where }),
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
