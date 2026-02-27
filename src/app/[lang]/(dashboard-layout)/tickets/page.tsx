import { Prisma } from "@prisma/client"

import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TicketsTable } from "./_components/tickets-table"

export const metadata: Metadata = {
  title: "Tickets",
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const search = params.search || ""
  const paymentStatus = params.status || ""
  const pageSize = 20

  const where: Prisma.PurchasedTicketsWhereInput = {}
  if (search) {
    where.OrderId = { contains: search, mode: "insensitive" }
  }
  if (paymentStatus) {
    where.PaymentStatus = paymentStatus
  }

  const [stats, purchases, totalCount] = await Promise.all([
    Promise.all([
      db.purchasedTickets.count(),
      db.purchasedTickets.aggregate({
        _sum: {
          TotalAmount: true,
          FeesAmount: true,
          GstAmount: true,
          PromoCodeDiscountAmount: true,
          TotalTickets: true,
        },
        where: { PaymentStatus: "captured" },
      }),
      db.purchasedTickets.count({
        where: { TotalAmount: { equals: new Prisma.Decimal(0) } },
      }),
      db.purchasedTickets.count({
        where: {
          TotalAmount: { not: { equals: new Prisma.Decimal(0) } },
          PaymentStatus: "captured",
        },
      }),
      db.purchasedTickets
        .findMany({
          where: { PaymentStatus: "captured" },
          select: { UserId: true },
        })
        .then((rows) => new Set(rows.map((r) => r.UserId)).size),
      db.purchasedTicketsQrs.count(),
      db.purchasedTicketsQrs.count({ where: { IsScanned: true } }),
    ]),
    db.purchasedTickets.findMany({
      where,
      orderBy: { CreatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        Id: true,
        OrderId: true,
        UserId: true,
        TotalTickets: true,
        TotalAmount: true,
        TotalAmountIncludingFees: true,
        PaymentStatus: true,
        CreatedAt: true,
        EventId: true,
        Events: {
          select: { Title: true },
        },
        Currencies: {
          select: { Symbol: true },
        },
      },
    }),
    db.purchasedTickets.count({ where }),
  ])

  const [
    totalSold,
    revenueAgg,
    freeCount,
    paidCount,
    uniqueBuyers,
    totalQrs,
    scannedQrs,
  ] = stats
  const totalRevenue = Number(revenueAgg._sum.TotalAmount ?? 0)
  const totalFees = Number(revenueAgg._sum.FeesAmount ?? 0)
  const totalGst = Number(revenueAgg._sum.GstAmount ?? 0)
  const totalPromoDiscount = Number(
    revenueAgg._sum.PromoCodeDiscountAmount ?? 0
  )
  const totalTicketsSold = revenueAgg._sum.TotalTickets ?? 0
  const avgOrderValue = paidCount > 0 ? totalRevenue / paidCount : 0
  const checkInRate = totalQrs > 0 ? (scannedQrs / totalQrs) * 100 : 0

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <p className="text-muted-foreground">
          View ticket sales, purchase history, and promo codes
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <CardContent className="p-0 pt-1">
              <p className="text-2xl font-semibold">
                ₹{totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {totalTicketsSold.toLocaleString()} tickets across{" "}
                {totalSold.toLocaleString()} purchases
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Earnings
            </CardTitle>
            <CardContent className="p-0 pt-1">
              <p className="text-2xl font-semibold">
                ₹{(totalFees + totalGst).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Fees ₹{totalFees.toLocaleString()} + GST ₹
                {totalGst.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tickets Breakdown
            </CardTitle>
            <CardContent className="p-0 pt-1">
              <p className="text-2xl font-semibold">
                {paidCount.toLocaleString()}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  paid
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {freeCount.toLocaleString()} free &middot;{" "}
                {uniqueBuyers.toLocaleString()} unique buyers
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Check-in &amp; Stats
            </CardTitle>
            <CardContent className="p-0 pt-1">
              <p className="text-2xl font-semibold">
                {checkInRate.toFixed(1)}%{" "}
                <span className="text-base font-normal text-muted-foreground">
                  scanned
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Avg order ₹
                {avgOrderValue.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
                {totalPromoDiscount > 0 && (
                  <>
                    {" "}
                    &middot; ₹{totalPromoDiscount.toLocaleString()} in promos
                  </>
                )}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
      </div>

      <TicketsTable
        purchases={purchases}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        search={search}
        paymentStatus={paymentStatus}
      />
    </section>
  )
}
