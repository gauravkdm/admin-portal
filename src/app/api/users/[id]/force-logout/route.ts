import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { db } from "@/lib/prisma"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const userTokens = await db.userTokens.findMany({
    where: { UserId: id },
    select: { AccessTokenId: true, RefreshTokenId: true },
  })

  if (userTokens.length > 0) {
    const accessTokenIds = userTokens.map((t) => t.AccessTokenId)
    const refreshTokenIds = userTokens.map((t) => t.RefreshTokenId)

    await db.$transaction([
      db.userTokens.deleteMany({ where: { UserId: id } }),
      db.accessTokens.deleteMany({ where: { Id: { in: accessTokenIds } } }),
      db.refreshTokens.deleteMany({ where: { Id: { in: refreshTokenIds } } }),
    ])
  }

  await db.userDeviceTokens.updateMany({
    where: { UserId: id },
    data: { IsActive: false, IsSessionActive: false },
  })

  return NextResponse.json({
    message: "User logged out from all devices",
    tokensRemoved: userTokens.length,
  })
}
