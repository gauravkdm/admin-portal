import { notFound } from "next/navigation"

import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { EventActions } from "./_components/event-actions"
import { EventInfoCard } from "./_components/event-info-card"
import { GuestList } from "./_components/guest-list"
import { MediaGallery } from "./_components/media-gallery"
import { TicketSummary } from "./_components/ticket-summary"

export const metadata: Metadata = {
  title: "Event Details",
}

async function getEvent(id: string) {
  const event = await db.events.findUnique({
    where: { Id: id },
    include: {
      EventRsvps: {
        include: {
          Users: {
            select: {
              Id: true,
              FirstName: true,
              LastName: true,
              Email: true,
              ProfilePhotoCdnUrl1: true,
            },
          },
        },
        orderBy: { CreatedAt: "desc" },
      },
      Tickets: true,
      EventsMedia: true,
      EventCategoryMappings: {
        include: { EventCategories: { select: { Name: true } } },
      },
    },
  })
  return event
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await getEvent(id)

  if (!event) notFound()

  const hostUser = await db.users.findUnique({
    where: { Id: event.HostUserId },
    select: {
      Id: true,
      FirstName: true,
      LastName: true,
      Email: true,
      ProfilePhotoCdnUrl1: true,
    },
  })

  const rsvpCount = event.EventRsvps.length

  return (
    <section className="container p-4 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{event.Title}</h1>
          <p className="text-muted-foreground">
            {event.City || "No location"} &middot; {event.EventType}
          </p>
        </div>
        <EventActions
          eventId={event.Id}
          isPublished={event.IsPublished}
          status={event.Status}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EventInfoCard
          event={event}
          rsvpCount={rsvpCount}
          hostUser={hostUser}
        />
        <TicketSummary tickets={event.Tickets} />
      </div>

      {event.EventsMedia.length > 0 && (
        <MediaGallery media={event.EventsMedia} />
      )}

      <GuestList guests={event.EventRsvps} />
    </section>
  )
}
