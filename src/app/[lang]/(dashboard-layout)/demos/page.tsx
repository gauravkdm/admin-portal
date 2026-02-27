import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DemoActions, StatusBadge } from "./_components/demo-actions"
import { DemosPagination } from "./_components/demos-pagination"

export const metadata: Metadata = {
  title: "Demo Requests",
}

const PAGE_SIZE = 20
const STATUS_OPTIONS = [
  "Pending",
  "Contacted",
  "Scheduled",
  "Completed",
  "Cancelled",
]

export default async function DemosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const statusFilter = params.status || ""

  const where = statusFilter ? { Status: statusFilter } : {}

  const [demos, totalCount] = await Promise.all([
    db.demoRequests.findMany({
      where,
      orderBy: { CreatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.demoRequests.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  function buildSearchParams(updates: { page?: number; status?: string }) {
    const sp = new URLSearchParams()
    if (updates.page && updates.page > 1) sp.set("page", String(updates.page))
    if (updates.status) sp.set("status", updates.status)
    return sp.toString()
  }

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Demo Requests</h1>
        <p className="text-muted-foreground">
          Manage demo requests and scheduling ({totalCount} total)
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter demo requests by status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant={!statusFilter ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={`/demos?${buildSearchParams({ status: "" })}`}>
              All
            </Link>
          </Button>
          {STATUS_OPTIONS.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/demos?${buildSearchParams({ status: s })}`}>
                {s}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled At</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demos.map((demo) => (
              <TableRow key={demo.Id}>
                <TableCell>{demo.FullName || "-"}</TableCell>
                <TableCell className="text-sm">{demo.Email || "-"}</TableCell>
                <TableCell className="text-sm">
                  {demo.CompanyOrganization || "-"}
                </TableCell>
                <TableCell className="text-sm">
                  {demo.EventType || "-"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={demo.Status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {demo.ScheduledDemoAt
                    ? new Date(demo.ScheduledDemoAt).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {demo.CreatedAt
                    ? formatDistanceToNow(new Date(demo.CreatedAt), {
                        addSuffix: true,
                      })
                    : "-"}
                </TableCell>
                <TableCell>
                  <DemoActions demo={demo} />
                </TableCell>
              </TableRow>
            ))}
            {demos.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No demo requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DemosPagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        statusFilter={statusFilter}
      />
    </section>
  )
}
