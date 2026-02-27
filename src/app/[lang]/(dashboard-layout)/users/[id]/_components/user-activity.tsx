import { format, formatDistanceToNow } from "date-fns"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

interface UserActivityProps {
  user: {
    EventRsvps: Array<{
      Id: number
      Status: string | null
      CreatedAt: Date
      Events: {
        Id: string
        Title: string
        Status: string | null
        StartTime: Date
      }
    }>
    UserDeviceTokens: Array<{
      Id: number
      Platform: string | null
      DeviceId: string | null
      AppVersion: string | null
      IsActive: boolean
      LastUsedAt: Date | null
      IsSessionActive: boolean
    }>
    Notifications: Array<{
      Id: number
      Title: string | null
      Message: string | null
      IsRead: boolean
      CreatedAt: Date
    }>
  }
}

export function UserActivity({ user }: UserActivityProps) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="p-6">
          <CardTitle>Recent RSVPs</CardTitle>
          <CardDescription>Events the user has RSVP&apos;d to</CardDescription>
        </div>
        <CardContent className="space-y-3">
          {user.EventRsvps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No RSVPs yet</p>
          ) : (
            user.EventRsvps.map((rsvp) => (
              <div key={rsvp.Id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{rsvp.Events.Title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(rsvp.Events.StartTime), "PPp")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{rsvp.Status}</Badge>
                  <Badge variant="secondary">{rsvp.Events.Status}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <div className="p-6">
          <CardTitle>Active Devices</CardTitle>
          <CardDescription>Devices with active sessions</CardDescription>
        </div>
        <CardContent className="space-y-3">
          {user.UserDeviceTokens.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active devices</p>
          ) : (
            user.UserDeviceTokens.map((device) => (
              <div
                key={device.Id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium capitalize">
                    {device.Platform || "Unknown"} Device
                  </p>
                  <p className="text-xs text-muted-foreground">
                    v{device.AppVersion || "?"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {device.IsSessionActive && (
                    <Badge className="bg-green-100 text-green-700">
                      Active
                    </Badge>
                  )}
                  {device.LastUsedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(device.LastUsedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
