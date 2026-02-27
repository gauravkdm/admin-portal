"use client"

import { Banknote, Percent, Receipt, Tag } from "lucide-react"

import type { Decimal } from "@prisma/client/runtime/library"

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface FinancialBreakdownProps {
  purchase: {
    TotalAmount: Decimal
    TotalAmountIncludingFees: Decimal
    FeesAmount: Decimal
    GstAmount: Decimal
    FeesPercentage: Decimal
    GstPercentage: Decimal
    PromoCodeId: number | null
    PromoCodeDiscountAmount: Decimal
  }
  currencySymbol: string
}

function fmt(symbol: string, amount: number) {
  return `${symbol}${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
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

export function FinancialBreakdown({
  purchase,
  currencySymbol,
}: FinancialBreakdownProps) {
  const baseAmount = Number(purchase.TotalAmount)
  const fees = Number(purchase.FeesAmount)
  const gst = Number(purchase.GstAmount)
  const total = Number(purchase.TotalAmountIncludingFees)
  const promoDiscount = Number(purchase.PromoCodeDiscountAmount)
  const feesPercent = Number(purchase.FeesPercentage)
  const gstPercent = Number(purchase.GstPercentage)
  const s = currencySymbol

  return (
    <Card>
      <div className="p-6">
        <CardTitle>Financial Breakdown</CardTitle>
        <CardDescription>
          Detailed amount breakdown for this purchase
        </CardDescription>
      </div>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatRow
            icon={Banknote}
            label="Base Amount"
            value={fmt(s, baseAmount)}
          />
          <StatRow
            icon={Receipt}
            label="Total (incl. fees)"
            value={fmt(s, total)}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <StatRow
            icon={Percent}
            label="Platform Fees"
            value={fmt(s, fees)}
            subValue={`${feesPercent}% of base amount`}
          />
          <StatRow
            icon={Percent}
            label="GST"
            value={fmt(s, gst)}
            subValue={`${gstPercent}%`}
          />
          {promoDiscount > 0 && (
            <StatRow
              icon={Tag}
              label="Promo Discount"
              value={`-${fmt(s, promoDiscount)}`}
              subValue={
                purchase.PromoCodeId
                  ? `Promo Code #${purchase.PromoCodeId}`
                  : undefined
              }
            />
          )}
        </div>

        <Separator />

        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Net to Host
            </span>
            <span className="text-lg font-bold">
              {fmt(s, baseAmount - promoDiscount)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-medium text-muted-foreground">
              Platform Revenue
            </span>
            <span className="text-sm font-semibold">{fmt(s, fees + gst)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
