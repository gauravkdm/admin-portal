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
  if (status) where.PayoutStatus = status

  const [payouts, total, stats] = await Promise.all([
    db.eventPayouts.findMany({
      where,
      include: {
        Events: {
          select: { Id: true, Title: true },
        },
        Users: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
            ProfilePhotoCdnUrl1: true,
          },
        },
      },
      orderBy: { RequestedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.eventPayouts.count({ where }),
    db.eventPayouts.aggregate({
      _sum: {
        GrossRevenue: true,
        PlatformFees: true,
        GstAmount: true,
        NetAmount: true,
      },
      _count: true,
    }),
  ])

  return NextResponse.json({
    data: payouts,
    stats: {
      totalPayouts: stats._count,
      grossRevenue: stats._sum.GrossRevenue || 0,
      platformFees: stats._sum.PlatformFees || 0,
      gstCollected: stats._sum.GstAmount || 0,
      netPayouts: stats._sum.NetAmount || 0,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
