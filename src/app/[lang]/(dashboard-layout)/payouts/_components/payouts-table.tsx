"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"

import type { Decimal } from "@prisma/client/runtime/library"

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

type Payout = {
  Id: number
  GrossRevenue: Decimal
  PlatformFees: Decimal
  NetAmount: Decimal
  PayoutStatus: string | null
  RazorpayPayoutId: string | null
  HostUserId: string
  RequestedAt: Date
  ProcessedAt: Date | null
  EventId: string
  Events: { Title: string } | null
  Users: { FirstName: string | null; LastName: string | null } | null
}

interface PayoutsTableProps {
  payouts: Payout[]
  totalCount: number
  currentPage: number
  pageSize: number
  payoutStatus: string
}

const PAYOUT_STATUSES = [
  "Pending",
  "Processing",
  "Completed",
  "Failed",
  "Cancelled",
]

function statusBadgeClass(status: string | null) {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "Pending":
    case "Processing":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Failed":
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function PayoutsTable({
  payouts,
  totalCount,
  currentPage,
  pageSize,
  payoutStatus,
}: PayoutsTableProps) {
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
      <div className="flex items-center">
        <Select
          value={payoutStatus || "all"}
          onValueChange={(v) => updateParams({ status: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payout Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {PAYOUT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {payouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-lg font-medium text-muted-foreground">
            No payouts found
          </p>
          <p className="text-sm text-muted-foreground">
            {payoutStatus
              ? "Try adjusting your filter"
              : "Event payouts will appear here"}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead className="text-right">Gross Revenue</TableHead>
                  <TableHead className="text-right">Net Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Razorpay ID</TableHead>
                  <TableHead>Requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => {
                  const hostName = p.Users
                    ? [p.Users.FirstName, p.Users.LastName]
                        .filter(Boolean)
                        .join(" ") || p.HostUserId.slice(0, 8) + "..."
                    : p.HostUserId.slice(0, 8) + "..."

                  return (
                    <TableRow key={p.Id}>
                      <TableCell className="max-w-[200px] truncate">
                        {p.Events?.Title || p.EventId}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {hostName}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        ₹{Number(p.GrossRevenue).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap font-medium">
                        ₹{Number(p.NetAmount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusBadgeClass(p.PayoutStatus)}
                        >
                          {p.PayoutStatus || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[140px] truncate">
                        {p.RazorpayPayoutId || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {format(new Date(p.RequestedAt), "dd MMM yyyy")}
                      </TableCell>
                    </TableRow>
                  )
                })}
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
