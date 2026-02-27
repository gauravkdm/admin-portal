"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

type Notification = {
  Id: number
  Title: string | null
  Body: string | null
  Platform: string | null
  Status: string | null
  SentAt: Date
  DeliveredAt: Date | null
  FailedAt: Date | null
  FcmMessageId: string | null
  ErrorMessage: string | null
}

interface NotificationsTableProps {
  notifications: Notification[]
  totalCount: number
  currentPage: number
  pageSize: number
  statusFilter: string
}

const STATUSES = ["sent", "delivered", "failed", "pending"]

function statusBadgeClass(status: string | null) {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200"
    case "sent":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "failed":
      return "bg-red-100 text-red-800 border-red-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function NotificationsTable({
  notifications,
  totalCount,
  currentPage,
  pageSize,
  statusFilter,
}: NotificationsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(totalCount / pageSize)

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    if (updates.status !== undefined) {
      params.delete("page")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => updateParams({ status: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-lg font-medium text-muted-foreground">
            No notifications found
          </p>
          <p className="text-sm text-muted-foreground">
            {statusFilter
              ? "Try adjusting your filters"
              : "Push notification history will appear here"}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Body</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow key={n.Id}>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {n.Title || "—"}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {n.Body || "—"}
                    </TableCell>
                    <TableCell>
                      {n.Platform ? (
                        <Badge variant="outline" className="bg-gray-50">
                          {n.Platform}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusBadgeClass(n.Status)}
                      >
                        {n.Status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(n.SentAt), "dd MMM yyyy, HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => updateParams({ page: String(currentPage - 1) })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => updateParams({ page: String(currentPage + 1) })}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
