import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { OverviewStats } from "./_components/overview-stats"
import { PendingReports } from "./_components/pending-reports"
import { RecentEvents } from "./_components/recent-events"
import { RecentUsers } from "./_components/recent-users"

export const metadata: Metadata = {
  title: "Dashboard",
}

async function getDashboardStats() {
  const [
    totalUsers,
    totalEvents,
    totalPurchasedTickets,
    pendingReports,
    recentUsers,
    recentEvents,
    pendingContactMessages,
  ] = await Promise.all([
    db.users.count(),
    db.events.count(),
    db.purchasedTickets.count(),
    db.userReports.count({ where: { Status: "Pending" } }),
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
    db.contactMessages.count({ where: { Status: "Pending" } }),
  ])

  const totalRevenue = await db.purchasedTickets.aggregate({
    _sum: { TotalAmount: true },
    where: { PaymentStatus: "captured" },
  })

  return {
    totalUsers,
    totalEvents,
    totalPurchasedTickets,
    totalRevenue: totalRevenue._sum.TotalAmount || 0,
    pendingReports,
    pendingContactMessages,
    recentUsers,
    recentEvents,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <section className="container grid gap-4 p-4">
      <OverviewStats
        totalUsers={stats.totalUsers}
        totalEvents={stats.totalEvents}
        totalTicketsSold={stats.totalPurchasedTickets}
        totalRevenue={Number(stats.totalRevenue)}
        pendingReports={stats.pendingReports}
        pendingContactMessages={stats.pendingContactMessages}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <RecentUsers users={stats.recentUsers} />
        <RecentEvents events={stats.recentEvents} />
      </div>
      <PendingReports count={stats.pendingReports} />
    </section>
  )
}
