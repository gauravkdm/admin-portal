"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import type { Decimal } from "@prisma/client/runtime/library"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

interface Purchase {
  Id: number
  TotalAmount: Decimal
  TotalTickets: number
  PaymentStatus: string | null
  CreatedAt: Date
  Events: { Title: string } | null
  Currencies: { Symbol: string | null } | null
}

function statusClass(status: string | null) {
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

export function RecentPurchases({ purchases }: { purchases: Purchase[] }) {
  return (
    <Card asChild>
      <article>
        <div className="p-6">
          <CardTitle>Recent Purchases</CardTitle>
          <CardDescription>Latest ticket purchases</CardDescription>
        </div>
        <CardContent className="space-y-3">
          {purchases.map((p) => (
            <Link
              key={p.Id}
              href={`tickets/${p.Id}`}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-sm font-medium truncate">
                  {p.Events?.Title || "Unknown Event"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.TotalTickets} ticket{p.TotalTickets !== 1 ? "s" : ""}{" "}
                  &middot;{" "}
                  {formatDistanceToNow(new Date(p.CreatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold">
                  {p.Currencies?.Symbol ?? "₹"}
                  {Number(p.TotalAmount).toLocaleString()}
                </span>
                <Badge
                  variant="outline"
                  className={statusClass(p.PaymentStatus)}
                >
                  {p.PaymentStatus || "—"}
                </Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </article>
    </Card>
  )
}
