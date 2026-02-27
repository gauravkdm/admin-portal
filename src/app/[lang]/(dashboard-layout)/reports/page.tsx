import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { ReportActions, StatusBadge } from "./_components/report-actions"
import { ReportsPagination } from "./_components/reports-pagination"

export const metadata: Metadata = {
  title: "User Reports",
}

const PAGE_SIZE = 20
const STATUS_OPTIONS = ["Pending", "Reviewed", "Resolved", "Dismissed"]

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const statusFilter = params.status || ""

  const where = statusFilter ? { Status: statusFilter } : {}

  const [reports, totalCount] = await Promise.all([
    db.userReports.findMany({
      where,
      orderBy: { ReportedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        Users_UserReports_ReporterUserIdToUsers: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
            ProfilePhotoCdnUrl1: true,
          },
        },
        Users_UserReports_ReportedUserIdToUsers: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
            ProfilePhotoCdnUrl1: true,
          },
        },
      },
    }),
    db.userReports.count({ where }),
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
        <h1 className="text-2xl font-semibold">User Reports</h1>
        <p className="text-muted-foreground">
          Review and moderate user reports ({totalCount} total)
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter reports by status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant={!statusFilter ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={`/reports?${buildSearchParams({ status: "" })}`}>
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
              <Link href={`/reports?${buildSearchParams({ status: s })}`}>
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
              <TableHead>Reporter</TableHead>
              <TableHead>Reported User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.Id}>
                <TableCell>
                  <Link
                    href={`/users/${report.Users_UserReports_ReporterUserIdToUsers.Id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          report.Users_UserReports_ReporterUserIdToUsers
                            .ProfilePhotoCdnUrl1 || undefined
                        }
                      />
                      <AvatarFallback>
                        {(
                          report.Users_UserReports_ReporterUserIdToUsers
                            .FirstName?.[0] || "?"
                        ).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {report.Users_UserReports_ReporterUserIdToUsers.FirstName}{" "}
                      {report.Users_UserReports_ReporterUserIdToUsers.LastName}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/users/${report.Users_UserReports_ReportedUserIdToUsers.Id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          report.Users_UserReports_ReportedUserIdToUsers
                            .ProfilePhotoCdnUrl1 || undefined
                        }
                      />
                      <AvatarFallback>
                        {(
                          report.Users_UserReports_ReportedUserIdToUsers
                            .FirstName?.[0] || "?"
                        ).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {report.Users_UserReports_ReportedUserIdToUsers.FirstName}{" "}
                      {report.Users_UserReports_ReportedUserIdToUsers.LastName}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  {report.ReportType || "-"}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm">
                  {report.Description || "-"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={report.Status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {report.ReportedAt
                    ? formatDistanceToNow(new Date(report.ReportedAt), {
                        addSuffix: true,
                      })
                    : "-"}
                </TableCell>
                <TableCell>
                  <ReportActions report={report} />
                </TableCell>
              </TableRow>
            ))}
            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No reports found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ReportsPagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        statusFilter={statusFilter}
      />
    </section>
  )
}
