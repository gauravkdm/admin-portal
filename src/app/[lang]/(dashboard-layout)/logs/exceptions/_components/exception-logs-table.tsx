"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ExceptionLog = {
  Id: number
  HttpMethod: string | null
  RequestPath: string | null
  StatusCode: number | null
  ExceptionMessage: string | null
  IsMobile: boolean | null
  Timestamp: Date
  IP: string | null
  UserAgent: string | null
  Referrer: string | null
  RequestDetails: string | null
}

interface ExceptionLogsTableProps {
  logs: ExceptionLog[]
  totalCount: number
  currentPage: number
  pageSize: number
  search: string
}

function statusCodeBadgeClass(code: number | null) {
  if (!code) return "bg-gray-100 text-gray-800 border-gray-200"
  if (code >= 500) return "bg-red-100 text-red-800 border-red-200"
  if (code >= 400) return "bg-yellow-100 text-yellow-800 border-yellow-200"
  return "bg-gray-100 text-gray-800 border-gray-200"
}

function methodBadgeClass(method: string | null) {
  switch (method?.toUpperCase()) {
    case "GET":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "POST":
      return "bg-green-100 text-green-800 border-green-200"
    case "PUT":
    case "PATCH":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "DELETE":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function ExceptionLogsTable({
  logs,
  totalCount,
  currentPage,
  pageSize,
  search,
}: ExceptionLogsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(totalCount / pageSize)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    if (updates.search !== undefined) {
      params.delete("page")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by exception message..."
          defaultValue={search}
          className="max-w-sm"
          onChange={(e) => {
            const timeout = setTimeout(() => {
              updateParams({ search: e.target.value })
            }, 400)
            return () => clearTimeout(timeout)
          }}
        />
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-lg font-medium text-muted-foreground">
            No exception logs found
          </p>
          <p className="text-sm text-muted-foreground">
            {search
              ? "Try adjusting your search"
              : "Exception logs will appear here"}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Method</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead className="w-[90px]">Status</TableHead>
                  <TableHead>Exception Message</TableHead>
                  <TableHead className="w-[80px]">Mobile</TableHead>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <Collapsible
                    key={log.Id}
                    open={expandedId === log.Id}
                    onOpenChange={(open) => setExpandedId(open ? log.Id : null)}
                    asChild
                  >
                    <>
                      <CollapsibleTrigger asChild>
                        <TableRow className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={methodBadgeClass(log.HttpMethod)}
                            >
                              {log.HttpMethod || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[250px] truncate font-mono text-sm">
                            {log.RequestPath || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusCodeBadgeClass(log.StatusCode)}
                            >
                              {log.StatusCode ?? "—"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate text-sm">
                            {log.ExceptionMessage || "—"}
                          </TableCell>
                          <TableCell>
                            {log.IsMobile != null ? (
                              <Badge
                                variant="outline"
                                className={
                                  log.IsMobile
                                    ? "bg-purple-100 text-purple-800 border-purple-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                }
                              >
                                {log.IsMobile ? "Yes" : "No"}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {format(
                              new Date(log.Timestamp),
                              "dd MMM yyyy, HH:mm:ss"
                            )}
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>
                      <CollapsibleContent asChild>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={6} className="p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                                  Full Exception Message
                                </p>
                                <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                                  {log.ExceptionMessage || "—"}
                                </pre>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                                    Request Details
                                  </p>
                                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                                    {log.RequestDetails || "—"}
                                  </pre>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                                      IP
                                    </span>
                                    <p className="font-mono text-xs">
                                      {log.IP || "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                                      Referrer
                                    </span>
                                    <p className="truncate text-xs">
                                      {log.Referrer || "—"}
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                                      User Agent
                                    </span>
                                    <p className="truncate text-xs">
                                      {log.UserAgent || "—"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => updateParams({ page: String(currentPage - 1) })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => updateParams({ page: String(currentPage + 1) })}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
