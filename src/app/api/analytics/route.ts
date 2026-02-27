import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { db } from "@/lib/prisma"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    newUsersThisMonth,
    verifiedUsers,
    totalEvents,
    publishedEvents,
    activeEvents,
    totalTicketsSold,
    revenue,
    totalPayouts,
    pendingPayouts,
    totalReports,
    pendingReports,
    totalContacts,
    pendingContacts,
    totalDemos,
    recentSignups,
    eventsByType,
    usersByGender,
  ] = await Promise.all([
    db.users.count(),
    db.users.count({
      where: { CreatedAt: { gte: thirtyDaysAgo } },
    }),
    db.users.count({ where: { IsVerified: true } }),
    db.events.count(),
    db.events.count({ where: { IsPublished: true } }),
    db.events.count({
      where: { EndTime: { gte: now }, IsPublished: true },
    }),
    db.purchasedTickets.aggregate({ _sum: { TotalTickets: true } }),
    db.purchasedTickets.aggregate({
      _sum: { TotalAmountIncludingFees: true },
    }),
    db.eventPayouts.count(),
    db.eventPayouts.count({ where: { PayoutStatus: "Pending" } }),
    db.userReports.count(),
    db.userReports.count({ where: { Status: "Pending" } }),
    db.contactMessages.count(),
    db.contactMessages.count({ where: { Status: "Pending" } }),
    db.demoRequests.count(),
    db.users.count({
      where: { CreatedAt: { gte: sevenDaysAgo } },
    }),
    db.events.groupBy({
      by: ["EventType"],
      _count: true,
      orderBy: { _count: { EventType: "desc" } },
    }),
    db.users.groupBy({
      by: ["Gender"],
      _count: true,
      where: { Gender: { not: null } },
    }),
  ])

  return NextResponse.json({
    data: {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        verified: verifiedUsers,
        recentSignups,
        byGender: usersByGender.map((g) => ({
          gender: g.Gender,
          count: g._count,
        })),
      },
      events: {
        total: totalEvents,
        published: publishedEvents,
        active: activeEvents,
        byType: eventsByType.map((e) => ({
          type: e.EventType,
          count: e._count,
        })),
      },
      financial: {
        totalTicketsSold: totalTicketsSold._sum.TotalTickets || 0,
        totalRevenue: revenue._sum.TotalAmountIncludingFees || 0,
        totalPayouts,
        pendingPayouts,
      },
      moderation: {
        reports: { total: totalReports, pending: pendingReports },
        contacts: { total: totalContacts, pending: pendingContacts },
        demos: totalDemos,
      },
    },
  })
}
