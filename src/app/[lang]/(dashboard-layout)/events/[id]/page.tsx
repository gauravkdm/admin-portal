import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink } from "lucide-react"

import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { Button } from "@/components/ui/button"
import { EventActions } from "./_components/event-actions"
import { EventInfoCard } from "./_components/event-info-card"
import { EventRevenueCard } from "./_components/event-revenue-card"
import { GuestList } from "./_components/guest-list"
import { MediaGallery } from "./_components/media-gallery"
import { TicketSummary } from "./_components/ticket-summary"

export const metadata: Metadata = {
  title: "Event Details",
}

async function getEvent(id: string) {
  const event = await db.events.findUnique({
    where: { Id: id },
    select: {
      Id: true,
      Title: true,
      Location: true,
      Description: true,
      EventType: true,
      Status: true,
      City: true,
      StartTime: true,
      EndTime: true,
      Capacity: true,
      IsPublished: true,
      AgeRestriction: true,
      TimeZone: true,
      CreatedAt: true,
      HostUserId: true,
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
        orderBy: { CreatedAt: "desc" as const },
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
      EventsMedia: {
        select: {
          Id: true,
          MediaUrl: true,
          Type: true,
        },
      },
      EventCategoryMappings: {
        include: { EventCategories: { select: { Name: true } } },
      },
    },
  })
  return event
}

async function getEventFinancials(eventId: string) {
  const [
    revenueAgg,
    ticketsSoldAgg,
    freeTicketsCount,
    paidTicketsCount,
    promoDiscountAgg,
    payout,
    totalQrs,
    scannedQrs,
    purchases,
    perTicketRevenue,
  ] = await Promise.all([
    db.purchasedTickets.aggregate({
      where: { EventId: eventId, PaymentStatus: "captured" },
      _sum: {
        TotalAmount: true,
        TotalAmountIncludingFees: true,
        FeesAmount: true,
        GstAmount: true,
      },
    }),
    db.purchasedTickets.aggregate({
      where: { EventId: eventId },
      _sum: { TotalTickets: true },
      _count: true,
    }),
    db.purchasedTickets.count({
      where: { EventId: eventId, TotalAmount: 0 },
    }),
    db.purchasedTickets.count({
      where: {
        EventId: eventId,
        PaymentStatus: "captured",
        TotalAmount: { gt: 0 },
      },
    }),
    db.purchasedTickets.aggregate({
      where: { EventId: eventId },
      _sum: { PromoCodeDiscountAmount: true },
    }),
    db.eventPayouts.findFirst({
      where: { EventId: eventId },
      orderBy: { RequestedAt: "desc" },
    }),
    db.purchasedTicketsQrs.count({
      where: { PurchasedTickets: { EventId: eventId } },
    }),
    db.purchasedTicketsQrs.count({
      where: { PurchasedTickets: { EventId: eventId }, IsScanned: true },
    }),
    db.purchasedTickets.findMany({
      where: { EventId: eventId },
      select: { UserId: true },
    }),
    db.purchasedTickets.groupBy({
      by: ["TicketId"],
      where: { EventId: eventId, PaymentStatus: "captured" },
      _sum: { TotalAmount: true, TotalTickets: true },
    }),
  ])

  const uniqueBuyers = new Set(purchases.map((p) => p.UserId)).size

  const ticketRevenueMap = new Map(
    perTicketRevenue.map((r) => [
      r.TicketId,
      {
        revenue: Number(r._sum.TotalAmount ?? 0),
        sold: r._sum.TotalTickets ?? 0,
      },
    ])
  )

  return {
    grossRevenue: Number(revenueAgg._sum.TotalAmount ?? 0),
    revenueWithFees: Number(revenueAgg._sum.TotalAmountIncludingFees ?? 0),
    platformFees: Number(revenueAgg._sum.FeesAmount ?? 0),
    gstAmount: Number(revenueAgg._sum.GstAmount ?? 0),
    totalTicketsSold: ticketsSoldAgg._sum.TotalTickets ?? 0,
    totalPurchases: ticketsSoldAgg._count,
    freeTicketsCount,
    paidTicketsCount,
    promoDiscounts: Number(promoDiscountAgg._sum.PromoCodeDiscountAmount ?? 0),
    payout: payout
      ? {
          status: payout.PayoutStatus,
          netAmount: Number(payout.NetAmount),
          grossRevenue: Number(payout.GrossRevenue),
          platformFees: Number(payout.PlatformFees),
          gstAmount: Number(payout.GstAmount),
          requestedAt: payout.RequestedAt,
          processedAt: payout.ProcessedAt,
        }
      : null,
    totalQrs,
    scannedQrs,
    uniqueBuyers,
    ticketRevenueMap,
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await getEvent(id)

  if (!event) notFound()

  const [hostUser, financials] = await Promise.all([
    db.users.findUnique({
      where: { Id: event.HostUserId },
      select: {
        Id: true,
        FirstName: true,
        LastName: true,
        Email: true,
        ProfilePhotoCdnUrl1: true,
      },
    }),
    getEventFinancials(id),
  ])

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`https://www.nexumevents.com/event-detail/${event.Id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-1.5 h-4 w-4" />
              View on Nexum
            </Link>
          </Button>
          <EventActions
            eventId={event.Id}
            isPublished={event.IsPublished}
            status={event.Status}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EventInfoCard
          event={event}
          rsvpCount={rsvpCount}
          hostUser={hostUser}
        />
        <EventRevenueCard financials={financials} />
      </div>

      <TicketSummary
        tickets={event.Tickets}
        ticketRevenueMap={financials.ticketRevenueMap}
      />

      {event.EventsMedia.length > 0 && (
        <MediaGallery media={event.EventsMedia} />
      )}

      <GuestList guests={event.EventRsvps} />
    </section>
  )
}
