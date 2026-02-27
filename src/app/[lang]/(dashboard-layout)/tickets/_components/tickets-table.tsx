"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"

import type { Decimal } from "@prisma/client/runtime/library"

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

type Purchase = {
  Id: number
  OrderId: string | null
  UserId: string
  TotalTickets: number
  TotalAmount: Decimal
  TotalAmountIncludingFees: Decimal
  PaymentStatus: string | null
  CreatedAt: Date
  EventId: string
  Events: { Title: string } | null
  Currencies: { Symbol: string | null } | null
}

interface TicketsTableProps {
  purchases: Purchase[]
  totalCount: number
  currentPage: number
  pageSize: number
  search: string
  paymentStatus: string
}

const PAYMENT_STATUSES = ["captured", "created", "failed", "refunded"]

function statusBadgeClass(status: string | null) {
  switch (status?.toLowerCase()) {
    case "captured":
      return "bg-green-100 text-green-800 border-green-200"
    case "created":
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "failed":
    case "refunded":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function TicketsTable({
  purchases,
  totalCount,
  currentPage,
  pageSize,
  search,
  paymentStatus,
}: TicketsTableProps) {
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
    if (updates.search !== undefined || updates.status !== undefined) {
      params.delete("page")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by Order ID..."
          defaultValue={search}
          className="max-w-sm"
          onChange={(e) => {
            const timeout = setTimeout(() => {
              updateParams({ search: e.target.value })
            }, 400)
            return () => clearTimeout(timeout)
          }}
        />
        <Select
          value={paymentStatus || "all"}
          onValueChange={(v) => updateParams({ status: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-lg font-medium text-muted-foreground">
            No tickets found
          </p>
          <p className="text-sm text-muted-foreground">
            {search || paymentStatus
              ? "Try adjusting your filters"
              : "Ticket purchases will appear here"}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Tickets</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p.Id}>
                    <TableCell className="font-mono text-xs">
                      {p.OrderId || "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {p.Events?.Title || p.EventId}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate">
                      {p.UserId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-right">
                      {p.TotalTickets}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {p.Currencies?.Symbol ?? "₹"}
                      {Number(p.TotalAmountIncludingFees).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusBadgeClass(p.PaymentStatus)}
                      >
                        {p.PaymentStatus || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(p.CreatedAt), "dd MMM yyyy")}
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
