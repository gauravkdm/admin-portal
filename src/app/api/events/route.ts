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
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status")
  const published = searchParams.get("published")

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { Title: { contains: search, mode: "insensitive" } },
      { Location: { contains: search, mode: "insensitive" } },
      { City: { contains: search, mode: "insensitive" } },
    ]
  }

  if (status) where.Status = status
  if (published === "true") where.IsPublished = true
  if (published === "false") where.IsPublished = false

  const [events, total] = await Promise.all([
    db.events.findMany({
      where,
      select: {
        Id: true,
        Title: true,
        Location: true,
        City: true,
        StartTime: true,
        EndTime: true,
        EventType: true,
        Status: true,
        IsPublished: true,
        Capacity: true,
        CreatedAt: true,
        HostUserId: true,
        _count: {
          select: {
            EventRsvps: true,
            Tickets: true,
            PurchasedTickets: true,
          },
        },
      },
      orderBy: { CreatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.events.count({ where }),
  ])

  return NextResponse.json({
    data: events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
