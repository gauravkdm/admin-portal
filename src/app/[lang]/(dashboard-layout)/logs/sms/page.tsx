import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmsLogsTable } from "./_components/sms-logs-table"

export const metadata: Metadata = {
  title: "SMS Logs",
}

export default async function SmsLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const statusFilter = params.status || ""
  const pageSize = 50

  const where = statusFilter
    ? {
        MessageStatus: {
          equals: statusFilter,
          mode: "insensitive" as const,
        },
      }
    : {}

  const [stats, logs, totalCount] = await Promise.all([
    Promise.all([
      db.sMSDeliveryLogs.count(),
      db.sMSDeliveryLogs.count({
        where: {
          MessageStatus: { equals: "delivered", mode: "insensitive" },
        },
      }),
    ]),
    db.sMSDeliveryLogs.findMany({
      where,
      orderBy: { DeliveryDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        Id: true,
        PhoneNumber: true,
        Email: true,
        MessageSid: true,
        MessageStatus: true,
        DeliveryDate: true,
        CountryId: true,
        ApplicationFeatureId: true,
        Countries: {
          select: { Name: true },
        },
        SMSApplicationFeatures: {
          select: { FeatureName: true },
        },
      },
    }),
    db.sMSDeliveryLogs.count({ where }),
  ])

  const [totalSms, deliveredCount] = stats
  const successRate =
    totalSms > 0 ? ((deliveredCount / totalSms) * 100).toFixed(1) : "0"

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">SMS Logs</h1>
        <p className="text-muted-foreground">Track SMS/OTP delivery status</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total SMS Sent
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold">
                {totalSms.toLocaleString()}
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
                {deliveredCount.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivery Success Rate
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold">{successRate}%</p>
            </CardContent>
          </CardHeader>
        </Card>
      </div>

      <SmsLogsTable
        logs={logs}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        statusFilter={statusFilter}
      />
    </section>
  )
}
