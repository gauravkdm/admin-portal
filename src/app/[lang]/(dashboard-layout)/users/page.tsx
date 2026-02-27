import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { UsersTable } from "./_components/users-table"

export const metadata: Metadata = {
  title: "Users",
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const search = params.search || ""
  const pageSize = 20

  const where = search
    ? {
        OR: [
          { FirstName: { contains: search, mode: "insensitive" as const } },
          { LastName: { contains: search, mode: "insensitive" as const } },
          { Email: { contains: search, mode: "insensitive" as const } },
          { PhoneNo: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [users, totalCount] = await Promise.all([
    db.users.findMany({
      where,
      orderBy: { CreatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        Id: true,
        FirstName: true,
        LastName: true,
        Email: true,
        PhoneNo: true,
        Gender: true,
        IsVerified: true,
        IsEmailVerified: true,
        IsPhoneVerified: true,
        ProfilePhotoCdnUrl1: true,
        LocationCity: true,
        LocationCountry: true,
        CreatedAt: true,
      },
    }),
    db.users.count({ where }),
  ])

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-muted-foreground">
          Manage all registered users ({totalCount.toLocaleString()} total)
        </p>
      </div>
      <UsersTable
        users={users}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        search={search}
      />
    </section>
  )
}
