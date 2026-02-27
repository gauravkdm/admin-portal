"use client"

import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { CalendarClock, MapPin, Users } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

interface UpcomingEvent {
  Id: string
  Title: string
  City: string | null
  StartTime: Date
  Capacity: number | null
  _count: { EventRsvps: number }
}

export function UpcomingEvents({ events }: { events: UpcomingEvent[] }) {
  if (events.length === 0) {
    return (
      <Card asChild>
        <article>
          <div className="p-6">
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>No upcoming events</CardDescription>
          </div>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Published events with future start times will appear here.
            </p>
          </CardContent>
        </article>
      </Card>
    )
  }

  return (
    <Card asChild>
      <article>
        <div className="p-6">
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>
            Next {events.length} published event
            {events.length !== 1 ? "s" : ""}
          </CardDescription>
        </div>
        <CardContent className="space-y-3">
          {events.map((event) => (
            <Link
              key={event.Id}
              href={`events/${event.Id}`}
              className="block rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.Title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {event.City && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.City}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {format(new Date(event.StartTime), "dd MMM, h:mm a")}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {event._count.EventRsvps}
                    {event.Capacity != null && ` / ${event.Capacity}`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.StartTime), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </article>
    </Card>
  )
}
