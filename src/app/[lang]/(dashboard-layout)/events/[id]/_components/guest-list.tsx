"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Search, UserX } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Guest {
  Id: number
  Status: string | null
  IsMatchingEnabled: boolean
  CreatedAt: Date
  Users: {
    Id: string
    FirstName: string | null
    LastName: string | null
    Email: string | null
    ProfilePhotoCdnUrl1: string | null
  }
}

interface GuestListProps {
  guests: Guest[]
}

function getRsvpStatusVariant(
  status: string | null
): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "going":
      return "default"
    case "pending":
    case "maybe":
      return "secondary"
    case "declined":
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}

const PAGE_SIZE = 10

export function GuestList({ guests }: GuestListProps) {
  const [searchValue, setSearchValue] = useState("")
  const [page, setPage] = useState(1)

  const filtered = guests.filter((g) => {
    if (!searchValue) return true
    const name = [g.Users.FirstName, g.Users.LastName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    const email = (g.Users.Email || "").toLowerCase()
    const query = searchValue.toLowerCase()
    return name.includes(query) || email.includes(query)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Card>
      <div className="p-6">
        <CardTitle>Guest List</CardTitle>
        <CardDescription>
          {guests.length} RSVP{guests.length !== 1 ? "s" : ""} total
        </CardDescription>
      </div>
      <CardContent className="space-y-4">
        {guests.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <UserX className="h-8 w-8" />
            <p className="text-sm">No guests have RSVP&apos;d yet</p>
          </div>
        ) : (
          <>
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guests..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Matching</TableHead>
                    <TableHead>RSVP Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <p className="text-sm text-muted-foreground">
                          No guests match your search
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((guest) => {
                      const name =
                        [guest.Users.FirstName, guest.Users.LastName]
                          .filter(Boolean)
                          .join(" ") || "Unknown"
                      return (
                        <TableRow key={guest.Id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage
                                  src={
                                    guest.Users.ProfilePhotoCdnUrl1 || undefined
                                  }
                                  alt={name}
                                />
                                <AvatarFallback className="text-xs">
                                  {name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">
                                {name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {guest.Users.Email || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRsvpStatusVariant(guest.Status)}>
                              {guest.Status || "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {guest.IsMatchingEnabled ? "Enabled" : "Disabled"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(guest.CreatedAt), "PP")}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
