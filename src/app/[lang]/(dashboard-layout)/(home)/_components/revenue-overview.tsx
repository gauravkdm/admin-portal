"use client"

import { Banknote, Receipt, Tag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface RevenueOverviewProps {
  totalRevenue: number
  platformFees: number
  gst: number
  promoDiscounts: number
  eventStatusMap: Record<string, number>
}

function fmt(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

function StatRow({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: typeof Banknote
  label: string
  value: string
  subValue?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        )}
      </div>
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  Upcoming: "bg-blue-100 text-blue-800 border-blue-200",
  "On-Going": "bg-green-100 text-green-800 border-green-200",
  Completed: "bg-gray-100 text-gray-800 border-gray-200",
  Draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
}

export function RevenueOverview({
  totalRevenue,
  platformFees,
  gst,
  promoDiscounts,
  eventStatusMap,
}: RevenueOverviewProps) {
  const netToHosts = totalRevenue - platformFees - gst

  return (
    <Card>
      <div className="p-6">
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Platform-wide financial summary</CardDescription>
      </div>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatRow
            icon={Banknote}
            label="Gross Revenue"
            value={fmt(totalRevenue)}
          />
          <StatRow
            icon={Receipt}
            label="Platform Earnings"
            value={fmt(platformFees + gst)}
            subValue={`Fees ${fmt(platformFees)} + GST ${fmt(gst)}`}
          />
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Net to Hosts</span>
            <span className="text-lg font-bold">{fmt(netToHosts)}</span>
          </div>
        </div>

        {promoDiscounts > 0 && (
          <StatRow
            icon={Tag}
            label="Promo Discounts Given"
            value={fmt(promoDiscounts)}
          />
        )}

        <Separator />

        <div>
          <p className="text-sm font-medium mb-2">Event Status Distribution</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(eventStatusMap).map(([status, count]) => (
              <Badge
                key={status}
                variant="outline"
                className={STATUS_COLORS[status] || ""}
              >
                {status}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
