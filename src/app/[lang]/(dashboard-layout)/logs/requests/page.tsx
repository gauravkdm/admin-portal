import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { RequestLogsTable } from "./_components/request-logs-table"

export const metadata: Metadata = {
  title: "Request Logs",
}

export default async function RequestLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; method?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const method = params.method || ""
  const search = params.search || ""
  const pageSize = 50

  const where: Record<string, unknown> = {}
  if (method) {
    where.HttpMethod = { equals: method, mode: "insensitive" }
  }
  if (search) {
    where.RequestPath = { contains: search, mode: "insensitive" }
  }

  const [logs, totalCount] = await Promise.all([
    db.requestLogs.findMany({
      where,
      orderBy: { Timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        Id: true,
        HttpMethod: true,
        RequestPath: true,
        StatusCode: true,
        IP: true,
        Timestamp: true,
        RequestBody: true,
        ResponseBody: true,
        Headers: true,
        RequestDetails: true,
      },
    }),
    db.requestLogs.count({ where }),
  ])

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Request Logs</h1>
        <p className="text-muted-foreground">
          View API request history ({totalCount.toLocaleString()} total)
        </p>
      </div>
      <RequestLogsTable
        logs={logs}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        method={method}
        search={search}
      />
    </section>
  )
}
