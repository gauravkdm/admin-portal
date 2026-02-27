"use client"

import { Heart, MessageCircle, MousePointerClick, Percent } from "lucide-react"

import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EngagementStatsProps {
  totalRsvps: number
  totalSwipes: number
  totalMatches: number
  matchRate: number
}

function EngagementCard({
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

export function EngagementStats({
  totalRsvps,
  totalSwipes,
  totalMatches,
  matchRate,
}: EngagementStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <EngagementCard
        title="Total RSVPs"
        value={totalRsvps.toLocaleString()}
        icon={<MessageCircle className={iconClass} />}
      />
      <EngagementCard
        title="Total Swipes"
        value={totalSwipes.toLocaleString()}
        icon={<MousePointerClick className={iconClass} />}
      />
      <EngagementCard
        title="Total Matches"
        value={totalMatches.toLocaleString()}
        icon={<Heart className={iconClass} />}
      />
      <EngagementCard
        title="Match Rate"
        value={`${matchRate.toFixed(1)}%`}
        icon={<Percent className={iconClass} />}
      />
    </div>
  )
}
