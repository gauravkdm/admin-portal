import { formatDistanceToNow } from "date-fns"
import { CheckCircle, XCircle } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

interface User {
  Id: string
  FirstName: string | null
  LastName: string | null
  Email: string | null
  PhoneNo: string | null
  ProfilePhotoCdnUrl1: string | null
  IsVerified: boolean
  CreatedAt: Date | null
}

export function RecentUsers({ users }: { users: User[] }) {
  return (
    <Card asChild>
      <article>
        <div className="p-6">
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Latest registered users</CardDescription>
        </div>
        <CardContent className="space-y-4">
          {users.map((user) => (
            <div key={user.Id} className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user.ProfilePhotoCdnUrl1 || undefined}
                  alt={user.FirstName || "User"}
                />
                <AvatarFallback>
                  {(user.FirstName?.[0] || "?").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium">
                  {user.FirstName} {user.LastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.PhoneNo || user.Email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {user.IsVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                {user.CreatedAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(user.CreatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </article>
    </Card>
  )
}
