"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle, Search, XCircle } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  Id: string
  FirstName: string | null
  LastName: string | null
  Email: string | null
  PhoneNo: string | null
  Gender: string | null
  IsVerified: boolean
  IsEmailVerified: boolean
  IsPhoneVerified: boolean
  ProfilePhotoCdnUrl1: string | null
  LocationCity: string | null
  LocationCountry: string | null
  CreatedAt: Date | null
}

interface UsersTableProps {
  users: User[]
  totalCount: number
  currentPage: number
  pageSize: number
  search: string
}

export function UsersTable({
  users,
  totalCount,
  currentPage,
  pageSize,
  search,
}: UsersTableProps) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(search)
  const totalPages = Math.ceil(totalCount / pageSize)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchValue) params.set("search", searchValue)
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  function goToPage(page: number) {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    params.set("page", page.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.Id}
                className="cursor-pointer"
                onClick={() => router.push(`/users/${user.Id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.ProfilePhotoCdnUrl1 || undefined}
                      />
                      <AvatarFallback>
                        {(user.FirstName?.[0] || "?").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.FirstName} {user.LastName}
                      </p>
                      {user.Gender && (
                        <p className="text-xs text-muted-foreground">
                          {user.Gender}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{user.PhoneNo || "-"}</TableCell>
                <TableCell className="text-sm">{user.Email || "-"}</TableCell>
                <TableCell className="text-sm">
                  {[user.LocationCity, user.LocationCountry]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </TableCell>
                <TableCell>
                  {user.IsVerified ? (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <XCircle className="mr-1 h-3 w-3" />
                      Unverified
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.CreatedAt
                    ? formatDistanceToNow(new Date(user.CreatedAt), {
                        addSuffix: true,
                      })
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
