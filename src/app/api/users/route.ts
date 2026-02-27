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
  const verified = searchParams.get("verified")

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { FirstName: { contains: search, mode: "insensitive" } },
      { LastName: { contains: search, mode: "insensitive" } },
      { Email: { contains: search, mode: "insensitive" } },
      { PhoneNo: { contains: search, mode: "insensitive" } },
    ]
  }

  if (verified === "true") where.IsVerified = true
  if (verified === "false") where.IsVerified = false

  const [users, total] = await Promise.all([
    db.users.findMany({
      where,
      select: {
        Id: true,
        FirstName: true,
        LastName: true,
        Email: true,
        PhoneNo: true,
        CountryCode: true,
        Gender: true,
        IsVerified: true,
        IsPhoneVerified: true,
        IsEmailVerified: true,
        ProfilePhotoCdnUrl1: true,
        LocationCity: true,
        LocationCountry: true,
        CreatedAt: true,
      },
      orderBy: { CreatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.users.count({ where }),
  ])

  return NextResponse.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
