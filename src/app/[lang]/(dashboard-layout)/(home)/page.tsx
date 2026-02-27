import { subDays } from "date-fns"

import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { ActionItems } from "./_components/action-items"
import { OverviewStats } from "./_components/overview-stats"
import { RecentEvents } from "./_components/recent-events"
import { RecentPurchases } from "./_components/recent-purchases"
import { RecentUsers } from "./_components/recent-users"
import { RevenueOverview } from "./_components/revenue-overview"
import { TopEventsByRevenue } from "./_components/top-events-by-revenue"
import { UpcomingEvents } from "./_components/upcoming-events"

export const metadata: Metadata = {
  title: "Dashboard",
}

async function getDashboardStats() {
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const sevenDaysAgo = subDays(now, 7)

  const [
    totalUsers,
    totalEvents,
    totalPurchases,
    usersLast30d,
    usersLast7d,
    eventsLast30d,
    purchasesLast7d,
    revenueAgg,
    platformEarningsAgg,
    totalQrs,
    scannedQrs,
    pendingReports,
    pendingContactMessages,
    pendingDemoRequests,
    pendingPayouts,
    recentUsers,
    recentEvents,
    upcomingEvents,
    recentPurchases,
    topEventsRaw,
    eventStatusCounts,
    uniqueBuyersAll,
  ] = await Promise.all([
    db.users.count(),
    db.events.count(),
    db.purchasedTickets.count(),
    db.users.count({ where: { CreatedAt: { gte: thirtyDaysAgo } } }),
    db.users.count({ where: { CreatedAt: { gte: sevenDaysAgo } } }),
    db.events.count({ where: { CreatedAt: { gte: thirtyDaysAgo } } }),
    db.purchasedTickets.count({ where: { CreatedAt: { gte: sevenDaysAgo } } }),
    db.purchasedTickets.aggregate({
      _sum: { TotalAmount: true, TotalTickets: true },
      where: { PaymentStatus: "captured" },
    }),
    db.purchasedTickets.aggregate({
      _sum: {
        FeesAmount: true,
        GstAmount: true,
        PromoCodeDiscountAmount: true,
      },
      where: { PaymentStatus: "captured" },
    }),
    db.purchasedTicketsQrs.count(),
    db.purchasedTicketsQrs.count({ where: { IsScanned: true } }),
    db.userReports.count({ where: { Status: "Pending" } }),
    db.contactMessages.count({ where: { Status: "Pending" } }),
    db.demoRequests.count({ where: { Status: "Pending" } }),
    db.eventPayouts.count({ where: { PayoutStatus: "Pending" } }),
    db.users.findMany({
      orderBy: { CreatedAt: "desc" },
      take: 5,
      select: {
        Id: true,
        FirstName: true,
        LastName: true,
        Email: true,
        PhoneNo: true,
        ProfilePhotoCdnUrl1: true,
        IsVerified: true,
        CreatedAt: true,
      },
    }),
    db.events.findMany({
      orderBy: { CreatedAt: "desc" },
      take: 5,
      select: {
        Id: true,
        Title: true,
        Status: true,
        City: true,
        StartTime: true,
        CreatedAt: true,
        HostUserId: true,
      },
    }),
    db.events.findMany({
      where: { StartTime: { gte: now }, IsPublished: true },
      orderBy: { StartTime: "asc" },
      take: 5,
      select: {
        Id: true,
        Title: true,
        City: true,
        StartTime: true,
        Capacity: true,
        _count: { select: { EventRsvps: true } },
      },
    }),
    db.purchasedTickets.findMany({
      orderBy: { CreatedAt: "desc" },
      take: 8,
      select: {
        Id: true,
        TotalAmount: true,
        TotalTickets: true,
        PaymentStatus: true,
        CreatedAt: true,
        Events: { select: { Title: true } },
        Currencies: { select: { Symbol: true } },
      },
    }),
    db.purchasedTickets.groupBy({
      by: ["EventId"],
      where: { PaymentStatus: "captured" },
      _sum: { TotalAmount: true, TotalTickets: true },
      orderBy: { _sum: { TotalAmount: "desc" } },
      take: 5,
    }),
    db.events.groupBy({
      by: ["Status"],
      _count: true,
    }),
    db.purchasedTickets
      .findMany({
        where: { PaymentStatus: "captured" },
        select: { UserId: true },
        distinct: ["UserId"],
      })
      .then((rows) => rows.length),
  ])

  const topEventIds = topEventsRaw.map((e) => e.EventId)
  const topEventDetails =
    topEventIds.length > 0
      ? await db.events.findMany({
          where: { Id: { in: topEventIds } },
          select: { Id: true, Title: true, City: true },
        })
      : []

  const topEventsMap = new Map(topEventDetails.map((e) => [e.Id, e]))

  const topEvents = topEventsRaw.map((e) => ({
    eventId: e.EventId,
    title: topEventsMap.get(e.EventId)?.Title ?? "Unknown",
    city: topEventsMap.get(e.EventId)?.City ?? null,
    revenue: Number(e._sum.TotalAmount ?? 0),
    ticketsSold: e._sum.TotalTickets ?? 0,
  }))

  const totalRevenue = Number(revenueAgg._sum.TotalAmount ?? 0)
  const totalTicketsSold = revenueAgg._sum.TotalTickets ?? 0
  const totalFees = Number(platformEarningsAgg._sum.FeesAmount ?? 0)
  const totalGst = Number(platformEarningsAgg._sum.GstAmount ?? 0)
  const totalPromoDiscounts = Number(
    platformEarningsAgg._sum.PromoCodeDiscountAmount ?? 0
  )

  const statusMap: Record<string, number> = {}
  for (const row of eventStatusCounts) {
    statusMap[row.Status ?? "Draft"] = row._count
  }

  return {
    totalUsers,
    totalEvents,
    totalPurchases,
    totalRevenue,
    totalTicketsSold,
    totalFees,
    totalGst,
    totalPromoDiscounts,
    usersLast30d,
    usersLast7d,
    eventsLast30d,
    purchasesLast7d,
    totalQrs,
    scannedQrs,
    uniqueBuyers: uniqueBuyersAll,
    pendingReports,
    pendingContactMessages,
    pendingDemoRequests,
    pendingPayouts,
    recentUsers,
    recentEvents,
    upcomingEvents,
    recentPurchases,
    topEvents,
    eventStatusMap: statusMap,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <section className="container grid gap-4 p-4">
      <OverviewStats
        totalUsers={stats.totalUsers}
        totalEvents={stats.totalEvents}
        totalPurchases={stats.totalPurchases}
        totalRevenue={stats.totalRevenue}
        totalTicketsSold={stats.totalTicketsSold}
        usersLast30d={stats.usersLast30d}
        usersLast7d={stats.usersLast7d}
        eventsLast30d={stats.eventsLast30d}
        purchasesLast7d={stats.purchasesLast7d}
        checkInRate={
          stats.totalQrs > 0 ? (stats.scannedQrs / stats.totalQrs) * 100 : 0
        }
        uniqueBuyers={stats.uniqueBuyers}
      />

      <ActionItems
        pendingReports={stats.pendingReports}
        pendingContactMessages={stats.pendingContactMessages}
        pendingDemoRequests={stats.pendingDemoRequests}
        pendingPayouts={stats.pendingPayouts}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueOverview
          totalRevenue={stats.totalRevenue}
          platformFees={stats.totalFees}
          gst={stats.totalGst}
          promoDiscounts={stats.totalPromoDiscounts}
          eventStatusMap={stats.eventStatusMap}
        />
        <TopEventsByRevenue events={stats.topEvents} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RecentUsers users={stats.recentUsers} />
        <RecentEvents events={stats.recentEvents} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RecentPurchases purchases={stats.recentPurchases} />
        <UpcomingEvents events={stats.upcomingEvents} />
      </div>
    </section>
  )
}
