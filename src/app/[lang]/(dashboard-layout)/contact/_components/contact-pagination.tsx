"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

interface ContactPaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  statusFilter: string
}

function buildSearchParams(page: number, status: string) {
  const sp = new URLSearchParams()
  if (page > 1) sp.set("page", String(page))
  if (status) sp.set("status", status)
  return sp.toString()
}

export function ContactPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  statusFilter,
}: ContactPaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {(currentPage - 1) * pageSize + 1} to{" "}
        {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
      </p>
      <div className="flex gap-2">
        {currentPage <= 1 ? (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/contact?${buildSearchParams(
                currentPage - 1,
                statusFilter
              )}`}
            >
              Previous
            </Link>
          </Button>
        )}
        {currentPage >= totalPages ? (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/contact?${buildSearchParams(
                currentPage + 1,
                statusFilter
              )}`}
            >
              Next
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
