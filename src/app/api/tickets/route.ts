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
  const eventId = searchParams.get("eventId")

  const where: Record<string, unknown> = {}
  if (status === "paid") where.PaymentStatus = "captured"
  if (status === "pending") where.PaymentStatus = "created"
  if (status === "free") where.PaymentStatus = null
  if (eventId) where.EventId = eventId

  const [tickets, total, stats] = await Promise.all([
    db.purchasedTickets.findMany({
      where,
      include: {
        Events: {
          select: { Id: true, Title: true },
        },
        Currencies: {
          select: { Code: true, Symbol: true },
        },
      },
      orderBy: { CreatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.purchasedTickets.count({ where }),
    db.purchasedTickets.aggregate({
      _sum: {
        TotalAmount: true,
        TotalAmountIncludingFees: true,
        TotalTickets: true,
      },
      _count: true,
    }),
  ])

  return NextResponse.json({
    data: tickets,
    stats: {
      totalPurchases: stats._count,
      totalTicketsSold: stats._sum.TotalTickets || 0,
      totalRevenue: stats._sum.TotalAmount || 0,
      totalRevenueWithFees: stats._sum.TotalAmountIncludingFees || 0,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
