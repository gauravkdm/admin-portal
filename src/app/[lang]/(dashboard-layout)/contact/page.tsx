import Link from "next/link"

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
import { ContactPagination } from "./_components/contact-pagination"
import { ContactRow } from "./_components/contact-row"

export const metadata: Metadata = {
  title: "Contact Messages",
}

const PAGE_SIZE = 20
const STATUS_OPTIONS = ["Pending", "InProgress", "Resolved", "Closed"]

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const statusFilter = params.status || ""

  const where = statusFilter ? { Status: statusFilter } : {}

  const [messages, totalCount] = await Promise.all([
    db.contactMessages.findMany({
      where,
      orderBy: { CreatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        Id: true,
        FullName: true,
        Email: true,
        InquiryType: true,
        Subject: true,
        Message: true,
        Status: true,
        AdminNotes: true,
        CreatedAt: true,
      },
    }),
    db.contactMessages.count({ where }),
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
        <h1 className="text-2xl font-semibold">Contact Messages</h1>
        <p className="text-muted-foreground">
          View and respond to contact form submissions ({totalCount} total)
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter messages by status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant={!statusFilter ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={`/contact?${buildSearchParams({ status: "" })}`}>
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
              <Link href={`/contact?${buildSearchParams({ status: s })}`}>
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
              <TableHead className="w-8"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <ContactRow key={message.Id} message={message} />
            ))}
            {messages.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No contact messages found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ContactPagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        statusFilter={statusFilter}
      />
    </section>
  )
}
