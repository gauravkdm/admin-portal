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

  const event = await db.events.findUnique({
    where: { Id: id },
    include: {
      EventsMedia: {
        select: { Id: true, MediaUrl: true, Type: true },
      },
      EventCategoryMappings: {
        include: {
          EventCategories: { select: { Id: true, Name: true, Unicode: true } },
        },
      },
      Tickets: {
        select: {
          Id: true,
          Name: true,
          Price: true,
          TotalTickets: true,
          AvailableTickets: true,
          IsFree: true,
          IsExpired: true,
          SaleStartTime: true,
          SaleEndTime: true,
        },
      },
      EventSections: {
        select: {
          Id: true,
          Type: true,
          Title: true,
          Content: true,
          Url: true,
          DisplayOrder: true,
        },
        orderBy: { DisplayOrder: "asc" },
      },
      _count: {
        select: {
          EventRsvps: true,
          EventComments: true,
          EventMatches: true,
          PurchasedTickets: true,
        },
      },
    },
  })

  if (!event) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 })
  }

  return NextResponse.json({ data: event })
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
    "Title",
    "Location",
    "Description",
    "StartTime",
    "EndTime",
    "EventType",
    "Status",
    "IsPublished",
    "City",
    "Capacity",
    "AgeRestriction",
    "Visibility",
    "ShowGuestList",
  ]

  const data: Record<string, unknown> = { UpdatedAt: new Date() }
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field]
    }
  }

  const event = await db.events.update({
    where: { Id: id },
    data,
  })

  return NextResponse.json({ data: event })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  await db.events.delete({ where: { Id: id } })

  return NextResponse.json({ message: "Event deleted successfully" })
}
