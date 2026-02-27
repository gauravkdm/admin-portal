import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExceptionLogsTable } from "./_components/exception-logs-table"

export const metadata: Metadata = {
  title: "Exception Logs",
}

export default async function ExceptionLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const search = params.search || ""
  const pageSize = 50

  const where = search
    ? {
        ExceptionMessage: { contains: search, mode: "insensitive" as const },
      }
    : {}

  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const [stats, logs, totalCount] = await Promise.all([
    Promise.all([
      db.exceptionLogs.count(),
      db.exceptionLogs.count({
        where: { Timestamp: { gte: last24h } },
      }),
      db.exceptionLogs.groupBy({
        by: ["StatusCode"],
        _count: { StatusCode: true },
        orderBy: { _count: { StatusCode: "desc" } },
        take: 1,
      }),
    ]),
    db.exceptionLogs.findMany({
      where,
      orderBy: { Timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        Id: true,
        HttpMethod: true,
        RequestPath: true,
        StatusCode: true,
        ExceptionMessage: true,
        IsMobile: true,
        Timestamp: true,
        IP: true,
        UserAgent: true,
        Referrer: true,
        RequestDetails: true,
      },
    }),
    db.exceptionLogs.count({ where }),
  ])

  const [totalExceptions, last24hCount, topStatusCode] = stats
  const mostCommonStatusCode =
    topStatusCode.length > 0 ? topStatusCode[0].StatusCode : null

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Exception Logs</h1>
        <p className="text-muted-foreground">
          View application errors and exceptions
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Exceptions
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold text-red-600">
                {totalExceptions.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last 24 Hours
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold text-yellow-600">
                {last24hCount.toLocaleString()}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Common Status Code
            </CardTitle>
            <CardContent>
              <p className="text-2xl font-semibold">
                {mostCommonStatusCode ?? "—"}
              </p>
            </CardContent>
          </CardHeader>
        </Card>
      </div>

      <ExceptionLogsTable
        logs={logs}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        search={search}
      />
    </section>
  )
}
