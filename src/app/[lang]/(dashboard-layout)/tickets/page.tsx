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
    // Summary stats
    Promise.all([
      db.purchasedTickets.count(),
      db.purchasedTickets.aggregate({
        _sum: { TotalAmount: true },
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

  const [totalSold, revenueAgg, freeCount, paidCount] = stats
  const totalRevenue = Number(revenueAgg._sum.TotalAmount ?? 0)

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
              Total Tickets Sold
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold">
                {totalSold.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold">
                ₹{totalRevenue.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Free Tickets
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold">
                {freeCount.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Tickets
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold">
                {paidCount.toLocaleString()}
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
