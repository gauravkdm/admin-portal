import type { Prisma } from "@prisma/client"
import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PayoutsTable } from "./_components/payouts-table"

export const metadata: Metadata = {
  title: "Payouts",
}

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const payoutStatus = params.status || ""
  const pageSize = 20

  const where: Prisma.EventPayoutsWhereInput = {}
  if (payoutStatus) {
    where.PayoutStatus = payoutStatus
  }

  const [stats, payouts, totalCount] = await Promise.all([
    // Summary stats
    Promise.all([
      db.eventPayouts.count(),
      db.eventPayouts.aggregate({
        _sum: { NetAmount: true },
        where: { PayoutStatus: "Completed" },
      }),
      db.eventPayouts.aggregate({
        _sum: { NetAmount: true },
        where: {
          PayoutStatus: { in: ["Pending", "Processing"] },
        },
      }),
      db.eventPayouts.count({
        where: {
          PayoutStatus: { in: ["Failed", "Cancelled"] },
        },
      }),
    ]),
    db.eventPayouts.findMany({
      where,
      orderBy: { RequestedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        Id: true,
        GrossRevenue: true,
        PlatformFees: true,
        NetAmount: true,
        PayoutStatus: true,
        RazorpayPayoutId: true,
        HostUserId: true,
        RequestedAt: true,
        ProcessedAt: true,
        EventId: true,
        Events: {
          select: { Title: true },
        },
        Users: {
          select: { FirstName: true, LastName: true },
        },
      },
    }),
    db.eventPayouts.count({ where }),
  ])

  const [totalPayouts, completedAgg, pendingAgg, failedCount] = stats
  const completedAmount = Number(completedAgg._sum.NetAmount ?? 0)
  const pendingAmount = Number(pendingAgg._sum.NetAmount ?? 0)

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Payouts</h1>
        <p className="text-muted-foreground">
          Manage event payouts and revenue distribution
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payouts
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold">
                {totalPayouts.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Amount
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold text-green-600">
                ₹{completedAmount.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Amount
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold text-yellow-600">
                ₹{pendingAmount.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed Count
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold text-red-600">
                {failedCount.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
      </div>

      <PayoutsTable
        payouts={payouts}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        payoutStatus={payoutStatus}
      />
    </section>
  )
}
