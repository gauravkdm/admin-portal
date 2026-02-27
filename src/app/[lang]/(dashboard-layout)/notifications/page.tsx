import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationsTable } from "./_components/notifications-table"

export const metadata: Metadata = {
  title: "Notifications",
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const statusFilter = params.status || ""
  const pageSize = 20

  const where = statusFilter
    ? { Status: { equals: statusFilter, mode: "insensitive" as const } }
    : {}

  const [stats, notifications, totalCount] = await Promise.all([
    Promise.all([
      db.pushNotificationHistories.count(),
      db.pushNotificationHistories.count({
        where: { DeliveredAt: { not: null } },
      }),
      db.pushNotificationHistories.count({
        where: { FailedAt: { not: null } },
      }),
      db.pushNotificationHistories.count({
        where: { DeliveredAt: null, FailedAt: null },
      }),
    ]),
    db.pushNotificationHistories.findMany({
      where,
      orderBy: { SentAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        Id: true,
        Title: true,
        Body: true,
        Platform: true,
        Status: true,
        SentAt: true,
        DeliveredAt: true,
        FailedAt: true,
        FcmMessageId: true,
        ErrorMessage: true,
      },
    }),
    db.pushNotificationHistories.count({ where }),
  ])

  const [totalSent, delivered, failed, pending] = stats

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-muted-foreground">
          Push notification delivery history and status tracking
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sent
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold">
                {totalSent.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivered
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold text-green-600">
                {delivered.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold text-red-600">
                {failed.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold text-yellow-600">
                {pending.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
      </div>

      <NotificationsTable
        notifications={notifications}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        statusFilter={statusFilter}
      />
    </section>
  )
}
