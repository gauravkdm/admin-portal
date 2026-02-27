import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { db } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const user = await db.users.findUnique({
    where: { Id: id },
    include: {
      UserDeviceTokens: {
        select: {
          Id: true,
          Platform: true,
          AppVersion: true,
          OsVersion: true,
          IsActive: true,
          LastUsedAt: true,
          CreatedAt: true,
        },
        orderBy: { LastUsedAt: "desc" },
      },
      UserTokens: {
        select: { Id: true, CreatedAt: true, LastUpdated: true },
        orderBy: { CreatedAt: "desc" },
        take: 5,
      },
      EventRsvps: {
        select: {
          Id: true,
          Status: true,
          CreatedAt: true,
          Events: {
            select: { Id: true, Title: true, StartTime: true },
          },
        },
        orderBy: { CreatedAt: "desc" },
        take: 10,
      },
    },
  })

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 })
  }

  const [hobbies, interests, languages] = await Promise.all([
    db.userHobbies
      .findMany({
        where: { UserId: id },
        select: { HobbiesId: true },
      })
      .then(async (uh) => {
        if (!uh.length) return []
        return db.hobbies.findMany({
          where: { Id: { in: uh.map((h) => h.HobbiesId) } },
        })
      }),
    db.userInterests
      .findMany({
        where: { UserId: id },
        select: { InterestsId: true },
      })
      .then(async (ui) => {
        if (!ui.length) return []
        return db.interests.findMany({
          where: { Id: { in: ui.map((i) => i.InterestsId) } },
        })
      }),
    db.userLanguages
      .findMany({
        where: { UserId: id },
        select: { LanguagesId: true },
      })
      .then(async (ul) => {
        if (!ul.length) return []
        return db.languages.findMany({
          where: { Id: { in: ul.map((l) => l.LanguagesId) } },
        })
      }),
  ])

  return NextResponse.json({
    data: { ...user, hobbies, interests, languages },
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await req.json()

  const allowedFields = [
    "FirstName",
    "LastName",
    "Email",
    "Gender",
    "Bio",
    "Occupation",
    "Education",
    "IsVerified",
    "LocationCity",
    "LocationCountry",
  ]

  const data: Record<string, unknown> = { UpdatedAt: new Date() }
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field]
    }
  }

  const user = await db.users.update({
    where: { Id: id },
    data,
  })

  return NextResponse.json({ data: user })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  await db.$transaction([
    db.userTokens.deleteMany({ where: { UserId: id } }),
    db.userDeviceTokens.deleteMany({ where: { UserId: id } }),
    db.userHobbies.deleteMany({ where: { UserId: id } }),
    db.userInterests.deleteMany({ where: { UserId: id } }),
    db.userLanguages.deleteMany({ where: { UserId: id } }),
    db.userAnswers.deleteMany({ where: { UserId: id } }),
    db.notifications.deleteMany({ where: { UserId: id } }),
    db.users.delete({ where: { Id: id } }),
  ])

  return NextResponse.json({ message: "User deleted successfully" })
}
