"use client"

import { format } from "date-fns"
import { Calendar, MapPin, User, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface HostUser {
  Id: string
  FirstName: string | null
  LastName: string | null
  Email: string | null
  ProfilePhotoCdnUrl1: string | null
}

interface EventInfoCardProps {
  event: {
    Title: string
    Location: string
    Description: string
    EventType: string
    Status: string | null
    City: string | null
    StartTime: Date
    EndTime: Date
    Capacity: number | null
    IsPublished: boolean
    AgeRestriction: string | null
    TimeZone: string | null
    CreatedAt: Date
    EventCategoryMappings: Array<{
      Id: number
      EventCategories: { Name: string }
    }>
  }
  rsvpCount: number
  hostUser: HostUser | null
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

export function EventInfoCard({
  event,
  rsvpCount,
  hostUser,
}: EventInfoCardProps) {
  const hostName = hostUser
    ? [hostUser.FirstName, hostUser.LastName].filter(Boolean).join(" ") ||
      "Unknown"
    : "Unknown"

  return (
    <Card>
      <div className="p-6">
        <CardTitle>Event Details</CardTitle>
        <CardDescription>Full event information</CardDescription>
      </div>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={getStatusVariant(event.Status)}>
            {event.Status || "Draft"}
          </Badge>
          <Badge variant={event.IsPublished ? "default" : "outline"}>
            {event.IsPublished ? "Published" : "Unpublished"}
          </Badge>
          {event.EventCategoryMappings.map((m) => (
            <Badge key={m.Id} variant="secondary">
              {m.EventCategories.Name}
            </Badge>
          ))}
        </div>

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-muted-foreground">Host</p>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={hostUser?.ProfilePhotoCdnUrl1 || undefined}
                    alt={hostName}
                  />
                  <AvatarFallback className="text-xs">
                    {hostName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p>{hostName}</p>
                  {hostUser?.Email && (
                    <p className="text-muted-foreground text-xs">
                      {hostUser.Email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-muted-foreground">Location</p>
              <p>{event.Location}</p>
              {event.City && (
                <p className="text-muted-foreground">{event.City}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-muted-foreground">Date & Time</p>
              <p>
                {format(new Date(event.StartTime), "PPp")} –{" "}
                {format(new Date(event.EndTime), "PPp")}
              </p>
              {event.TimeZone && (
                <p className="text-muted-foreground">{event.TimeZone}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-muted-foreground">RSVPs</p>
              <p>
                {rsvpCount} attendees
                {event.Capacity != null && ` / ${event.Capacity} capacity`}
              </p>
            </div>
          </div>

          {event.AgeRestriction && (
            <div>
              <p className="font-medium text-muted-foreground">
                Age Restriction
              </p>
              <p>{event.AgeRestriction}</p>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <p className="font-medium text-muted-foreground text-sm mb-1">
            Description
          </p>
          <p className="text-sm whitespace-pre-wrap">{event.Description}</p>
        </div>

        <p className="text-xs text-muted-foreground">
          Created {format(new Date(event.CreatedAt), "PPp")}
        </p>
      </CardContent>
    </Card>
  )
}
