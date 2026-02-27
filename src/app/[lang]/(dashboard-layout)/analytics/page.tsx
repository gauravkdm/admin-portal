import { startOfMonth, subMonths } from "date-fns"

import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { EngagementStats } from "./_components/engagement-stats"
import { EventStatusChart } from "./_components/event-status-chart"
import { OverviewStats } from "./_components/overview-stats"
import { PlatformUsageChart } from "./_components/platform-usage-chart"
import { RevenueTimelineChart } from "./_components/revenue-timeline-chart"
import { TopCitiesChart } from "./_components/top-cities-chart"
import { UserGrowthChart } from "./_components/user-growth-chart"

export const metadata: Metadata = {
  title: "Analytics",
}

export default async function AnalyticsPage() {
  const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 11))

  const [
    totalUsers,
    totalEvents,
    revenueAgg,
    totalMatches,
    activeSessions,
    userGrowth,
    eventStatusBreakdown,
    revenueTimeline,
    platformUsage,
    topCities,
    totalRsvps,
    totalSwipes,
  ] = await Promise.all([
    db.users.count(),
    db.events.count(),
    db.purchasedTickets.aggregate({
      _sum: { TotalAmount: true },
      where: { PaymentStatus: "captured" },
    }),
    db.eventMatches.count(),
    db.userDeviceTokens.count({ where: { IsSessionActive: true } }),

    db.$queryRaw<{ month: Date; count: number }[]>`
      SELECT DATE_TRUNC('month', "CreatedAt") as month, COUNT(*)::int as count
      FROM "Users"
      WHERE "CreatedAt" >= ${twelveMonthsAgo}
      GROUP BY month
      ORDER BY month
    `,

    db.events.groupBy({
      by: ["Status"],
      _count: { Id: true },
    }),

    db.$queryRaw<{ month: Date; total: number }[]>`
      SELECT DATE_TRUNC('month', "CreatedAt") as month, COALESCE(SUM("TotalAmount"), 0)::float as total
      FROM "PurchasedTickets"
      WHERE "PaymentStatus" = 'captured' AND "CreatedAt" >= ${twelveMonthsAgo}
      GROUP BY month
      ORDER BY month
    `,

    db.userDeviceTokens.groupBy({
      by: ["Platform"],
      _count: { Id: true },
      where: { IsActive: true },
    }),

    db.events.groupBy({
      by: ["City"],
      _count: { Id: true },
      orderBy: { _count: { Id: "desc" } },
      take: 10,
    }),

    db.eventRsvps.count(),
    db.eventSwipeActions.count(),
  ])

  const totalRevenue = Number(revenueAgg._sum.TotalAmount ?? 0)
  const matchRate = totalSwipes > 0 ? (totalMatches / totalSwipes) * 100 : 0

  const userGrowthData = userGrowth.map((r) => ({
    month: r.month.toISOString(),
    count: r.count,
  }))

  const eventStatusData = eventStatusBreakdown.map((r) => ({
    status: r.Status ?? "Unknown",
    count: r._count.Id,
  }))

  const revenueTimelineData = revenueTimeline.map((r) => ({
    month: r.month.toISOString(),
    total: r.total,
  }))

  const platformUsageData = platformUsage.map((r) => ({
    platform: r.Platform ?? "unknown",
    count: r._count.Id,
  }))

  const topCitiesData = topCities
    .filter((r) => r.City)
    .map((r) => ({
      city: r.City!,
      count: r._count.Id,
    }))

  return (
    <section className="container space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">Platform analytics and insights</p>
      </div>

      <OverviewStats
        totalUsers={totalUsers}
        totalEvents={totalEvents}
        totalRevenue={totalRevenue}
        totalMatches={totalMatches}
        activeSessions={activeSessions}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <UserGrowthChart data={userGrowthData} />
        <RevenueTimelineChart data={revenueTimelineData} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EventStatusChart data={eventStatusData} />
        <PlatformUsageChart data={platformUsageData} />
      </div>

      <TopCitiesChart data={topCitiesData} />

      <div>
        <h2 className="mb-4 text-xl font-semibold">Engagement</h2>
        <EngagementStats
          totalRsvps={totalRsvps}
          totalSwipes={totalSwipes}
          totalMatches={totalMatches}
          matchRate={matchRate}
        />
      </div>
    </section>
  )
}
