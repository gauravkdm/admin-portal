"use client"

import { Calendar, Heart, IndianRupee, Smartphone, Users } from "lucide-react"

import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OverviewStatsProps {
  totalUsers: number
  totalEvents: number
  totalRevenue: number
  totalMatches: number
  activeSessions: number
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

const iconClass = "size-4 text-muted-foreground"

export function OverviewStats({
  totalUsers,
  totalEvents,
  totalRevenue,
  totalMatches,
  activeSessions,
}: OverviewStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total Users"
        value={totalUsers.toLocaleString()}
        icon={<Users className={iconClass} />}
      />
      <StatCard
        title="Total Events"
        value={totalEvents.toLocaleString()}
        icon={<Calendar className={iconClass} />}
      />
      <StatCard
        title="Total Revenue"
        value={`₹${totalRevenue.toLocaleString()}`}
        icon={<IndianRupee className={iconClass} />}
      />
      <StatCard
        title="Total Matches"
        value={totalMatches.toLocaleString()}
        icon={<Heart className={iconClass} />}
      />
      <StatCard
        title="Active Sessions"
        value={activeSessions.toLocaleString()}
        icon={<Smartphone className={iconClass} />}
      />
    </div>
  )
}
