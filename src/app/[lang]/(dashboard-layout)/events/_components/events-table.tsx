"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarDays, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Draft", label: "Draft" },
  { value: "Upcoming", label: "Upcoming" },
  { value: "On-Going", label: "On-Going" },
  { value: "Completed", label: "Completed" },
]

interface Event {
  Id: string
  Title: string
  City: string | null
  Status: string | null
  EventType: string
  StartTime: Date
  Capacity: number | null
  IsPublished: boolean
  HostUserId: string
}

interface EventsTableProps {
  events: Event[]
  totalCount: number
  currentPage: number
  pageSize: number
  search: string
  statusFilter: string
  hostMap: Record<string, string>
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

export function EventsTable({
  events,
  totalCount,
  currentPage,
  pageSize,
  search,
  statusFilter,
  hostMap,
}: EventsTableProps) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(search)
  const totalPages = Math.ceil(totalCount / pageSize)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchValue) params.set("search", searchValue)
    if (statusFilter) params.set("status", statusFilter)
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  function handleStatusChange(value: string) {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (value && value !== "all") params.set("status", value)
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  function goToPage(page: number) {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    params.set("page", page.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Published</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-8 w-8" />
                    <p>No events found</p>
                    {(search || statusFilter) && (
                      <p className="text-xs">
                        Try adjusting your search or filters
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.Id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/events/${event.Id}`}
                      className="font-medium hover:underline"
                    >
                      {event.Title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(event.Status)}>
                      {event.Status || "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{event.City || "-"}</TableCell>
                  <TableCell className="text-sm">{event.EventType}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(event.StartTime), "PPp")}
                  </TableCell>
                  <TableCell className="text-sm">
                    {hostMap[event.HostUserId] || (
                      <span className="text-muted-foreground">
                        {event.HostUserId.slice(0, 8)}…
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {event.Capacity ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.IsPublished ? "default" : "outline"}>
                      {event.IsPublished ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
