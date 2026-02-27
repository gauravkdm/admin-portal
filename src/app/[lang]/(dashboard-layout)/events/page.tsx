import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { EventsTable } from "./_components/events-table"

export const metadata: Metadata = {
  title: "Events",
}

const VALID_STATUSES = ["Draft", "Upcoming", "On-Going", "Completed"]

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const search = params.search || ""
  const statusFilter = params.status || ""
  const pageSize = 20

  const where: {
    Title?: { contains: string; mode: "insensitive" }
    Status?: string
  } = {}

  if (search) {
    where.Title = { contains: search, mode: "insensitive" }
  }

  if (statusFilter && VALID_STATUSES.includes(statusFilter)) {
    where.Status = statusFilter
  }

  const [events, totalCount] = await Promise.all([
    db.events.findMany({
      where,
      orderBy: { CreatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        Id: true,
        Title: true,
        City: true,
        Status: true,
        EventType: true,
        StartTime: true,
        Capacity: true,
        IsPublished: true,
        HostUserId: true,
      },
    }),
    db.events.count({ where }),
  ])

  const hostUserIds = [...new Set(events.map((e) => e.HostUserId))]
  const hostUsers = hostUserIds.length
    ? await db.users.findMany({
        where: { Id: { in: hostUserIds } },
        select: { Id: true, FirstName: true, LastName: true },
      })
    : []
  const hostMap: Record<string, string> = Object.fromEntries(
    hostUsers.map((u) => [
      u.Id,
      [u.FirstName, u.LastName].filter(Boolean).join(" ") || "Unknown",
    ])
  )

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Events</h1>
        <p className="text-muted-foreground">
          Manage all events, publish/unpublish, view guest lists ({totalCount}{" "}
          total)
        </p>
      </div>
      <EventsTable
        events={events}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        search={search}
        statusFilter={statusFilter}
        hostMap={hostMap}
      />
    </section>
  )
}
