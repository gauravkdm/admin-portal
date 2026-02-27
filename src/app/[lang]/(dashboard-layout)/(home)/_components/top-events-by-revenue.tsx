"use client"

import Link from "next/link"
import { Trophy } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

interface TopEvent {
  eventId: string
  title: string
  city: string | null
  revenue: number
  ticketsSold: number
}

export function TopEventsByRevenue({ events }: { events: TopEvent[] }) {
  if (events.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <CardTitle>Top Events by Revenue</CardTitle>
          <CardDescription>No revenue data yet</CardDescription>
        </div>
      </Card>
    )
  }

  const maxRevenue = events[0]?.revenue || 1

  return (
    <Card>
      <div className="p-6">
        <CardTitle>Top Events by Revenue</CardTitle>
        <CardDescription>Highest earning events</CardDescription>
      </div>
      <CardContent className="space-y-4">
        {events.map((event, i) => (
          <div key={event.eventId} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {i === 0 && (
                  <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />
                )}
                <Link
                  href={`events/${event.eventId}`}
                  className="text-sm font-medium truncate hover:underline"
                >
                  {event.title}
                </Link>
              </div>
              <span className="text-sm font-semibold whitespace-nowrap ml-2">
                ₹{event.revenue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${(event.revenue / maxRevenue) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {event.ticketsSold} sold
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
