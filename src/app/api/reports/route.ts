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

  const [reports, total] = await Promise.all([
    db.userReports.findMany({
      where,
      include: {
        Users_UserReports_ReporterUserIdToUsers: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
            ProfilePhotoCdnUrl1: true,
          },
        },
        Users_UserReports_ReportedUserIdToUsers: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
            ProfilePhotoCdnUrl1: true,
          },
        },
      },
      orderBy: { ReportedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.userReports.count({ where }),
  ])

  return NextResponse.json({
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
