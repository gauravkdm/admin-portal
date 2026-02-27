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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type RequestLog = {
  Id: number
  HttpMethod: string | null
  RequestPath: string | null
  StatusCode: number | null
  IP: string | null
  Timestamp: Date
  RequestBody: string | null
  ResponseBody: string | null
  Headers: string | null
  RequestDetails: string | null
}

interface RequestLogsTableProps {
  logs: RequestLog[]
  totalCount: number
  currentPage: number
  pageSize: number
  method: string
  search: string
}

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"]

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

function statusCodeClass(code: number | null) {
  if (!code) return "text-muted-foreground"
  if (code >= 200 && code < 300) return "text-green-700 font-semibold"
  if (code >= 400 && code < 500) return "text-yellow-700 font-semibold"
  if (code >= 500) return "text-red-700 font-semibold"
  return "text-muted-foreground"
}

function tryFormatJson(raw: string | null): string {
  if (!raw) return "—"
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

export function RequestLogsTable({
  logs,
  totalCount,
  currentPage,
  pageSize,
  method,
  search,
}: RequestLogsTableProps) {
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
    if (updates.search !== undefined || updates.method !== undefined) {
      params.delete("page")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by path..."
          defaultValue={search}
          className="max-w-sm"
          onChange={(e) => {
            const timeout = setTimeout(() => {
              updateParams({ search: e.target.value })
            }, 400)
            return () => clearTimeout(timeout)
          }}
        />
        <Select
          value={method || "all"}
          onValueChange={(v) => updateParams({ method: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="HTTP Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            {HTTP_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-lg font-medium text-muted-foreground">
            No request logs found
          </p>
          <p className="text-sm text-muted-foreground">
            {search || method
              ? "Try adjusting your filters"
              : "API request logs will appear here"}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Method</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[140px]">IP</TableHead>
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
                          <TableCell className="max-w-[400px] truncate font-mono text-sm">
                            {log.RequestPath || "—"}
                          </TableCell>
                          <TableCell
                            className={statusCodeClass(log.StatusCode)}
                          >
                            {log.StatusCode ?? "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {log.IP || "—"}
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
                          <TableCell colSpan={5} className="p-4">
                            <div className="grid gap-4 md:grid-cols-3">
                              <div>
                                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                                  Request Body
                                </p>
                                <pre className="max-h-60 overflow-auto rounded-md bg-muted p-3 text-xs">
                                  {tryFormatJson(log.RequestBody)}
                                </pre>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                                  Response Body
                                </p>
                                <pre className="max-h-60 overflow-auto rounded-md bg-muted p-3 text-xs">
                                  {tryFormatJson(log.ResponseBody)}
                                </pre>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                                  Headers
                                </p>
                                <pre className="max-h-60 overflow-auto rounded-md bg-muted p-3 text-xs">
                                  {tryFormatJson(log.Headers)}
                                </pre>
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
