import { formatDistanceToNow } from "date-fns"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

interface Event {
  Id: string
  Title: string
  Status: string | null
  City: string | null
  StartTime: Date
  CreatedAt: Date
  HostUserId: string
}

function getStatusVariant(
  status: string | null
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Upcoming":
      return "default"
    case "On-Going":
      return "secondary"
    case "Completed":
      return "outline"
    case "Draft":
      return "outline"
    default:
      return "outline"
  }
}

export function RecentEvents({ events }: { events: Event[] }) {
  return (
    <Card asChild>
      <article>
        <div className="p-6">
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest created events</CardDescription>
        </div>
        <CardContent className="space-y-4">
          {events.map((event) => (
            <div key={event.Id} className="flex items-center gap-3">
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium">{event.Title}</p>
                <p className="text-xs text-muted-foreground">
                  {event.City || "No location"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(event.Status)}>
                  {event.Status || "Draft"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(event.CreatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </article>
    </Card>
  )
}
