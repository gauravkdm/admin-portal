"use client"

import { format } from "date-fns"
import {
  Banknote,
  CheckCircle,
  Clock,
  CreditCard,
  Percent,
  Receipt,
  Tag,
  Ticket,
  Users,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface EventRevenueCardProps {
  financials: {
    grossRevenue: number
    revenueWithFees: number
    platformFees: number
    gstAmount: number
    totalTicketsSold: number
    totalPurchases: number
    freeTicketsCount: number
    paidTicketsCount: number
    promoDiscounts: number
    payout: {
      status: string | null
      netAmount: number
      grossRevenue: number
      platformFees: number
      gstAmount: number
      requestedAt: Date
      processedAt: Date | null
    } | null
    totalQrs: number
    scannedQrs: number
    uniqueBuyers: number
  }
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function PayoutStatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="outline">No Payout</Badge>

  switch (status) {
    case "Completed":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      )
    case "Pending":
    case "Processing":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      )
    default:
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      )
  }
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

export function EventRevenueCard({ financials }: EventRevenueCardProps) {
  const {
    grossRevenue,
    platformFees,
    gstAmount,
    totalTicketsSold,
    freeTicketsCount,
    paidTicketsCount,
    promoDiscounts,
    payout,
    totalQrs,
    scannedQrs,
    uniqueBuyers,
  } = financials

  const avgTicketPrice =
    paidTicketsCount > 0 ? grossRevenue / paidTicketsCount : 0
  const checkInRate = totalQrs > 0 ? (scannedQrs / totalQrs) * 100 : 0

  return (
    <Card>
      <div className="p-6">
        <CardTitle>Revenue & Stats</CardTitle>
        <CardDescription>Financial performance for this event</CardDescription>
      </div>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatRow
            icon={Banknote}
            label="Gross Revenue"
            value={formatCurrency(grossRevenue)}
          />
          <StatRow
            icon={Receipt}
            label="Platform Fees"
            value={formatCurrency(platformFees)}
            subValue={
              gstAmount > 0 ? `GST: ${formatCurrency(gstAmount)}` : undefined
            }
          />
          <StatRow
            icon={CreditCard}
            label="Net to Host"
            value={
              payout
                ? formatCurrency(payout.netAmount)
                : formatCurrency(grossRevenue - platformFees - gstAmount)
            }
          />
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Payout Status</p>
              <div className="mt-0.5">
                <PayoutStatusBadge status={payout?.status ?? null} />
              </div>
              {payout?.processedAt && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(payout.processedAt), "PP")}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <StatRow
            icon={Ticket}
            label="Tickets Sold"
            value={totalTicketsSold.toLocaleString()}
            subValue={`${paidTicketsCount} paid · ${freeTicketsCount} free`}
          />
          <StatRow
            icon={Users}
            label="Unique Buyers"
            value={uniqueBuyers.toLocaleString()}
          />
          <StatRow
            icon={Percent}
            label="Check-in Rate"
            value={`${checkInRate.toFixed(1)}%`}
            subValue={`${scannedQrs} / ${totalQrs} scanned`}
          />
          <StatRow
            icon={Tag}
            label="Avg Ticket Price"
            value={formatCurrency(avgTicketPrice)}
          />
        </div>

        {promoDiscounts > 0 && (
          <>
            <Separator />
            <StatRow
              icon={Tag}
              label="Promo Discounts Applied"
              value={formatCurrency(promoDiscounts)}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
