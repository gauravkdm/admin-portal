"use client"

import { format } from "date-fns"
import { CheckCircle, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
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

interface QrCode {
  Id: number
  BarcodeData: string
  Type: number
  IsScanned: boolean
  CreatedAt: Date
  UserId: string | null
  Users: { FirstName: string | null; LastName: string | null } | null
}

interface SharedTicket {
  Id: number
  Status: number
  ExpiresAt: Date
  RedeemedAt: Date | null
  CreatedAt: Date
  Users_SharedTickets_SharedByUserIdToUsers: {
    FirstName: string | null
    LastName: string | null
  }
  Users_SharedTickets_RedeemedByUserIdToUsers: {
    FirstName: string | null
    LastName: string | null
  } | null
}

function shareStatusLabel(status: number) {
  switch (status) {
    case 0:
      return "Pending"
    case 1:
      return "Redeemed"
    case 2:
      return "Expired"
    case 3:
      return "Cancelled"
    default:
      return `Status ${status}`
  }
}

function shareStatusClass(status: number) {
  switch (status) {
    case 0:
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case 1:
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function userName(
  user: { FirstName: string | null; LastName: string | null } | null
) {
  if (!user) return "—"
  return [user.FirstName, user.LastName].filter(Boolean).join(" ") || "—"
}

export function QrCodesTable({
  qrCodes,
  scannedCount,
  sharedTickets,
}: {
  qrCodes: QrCode[]
  scannedCount: number
  sharedTickets: SharedTicket[]
}) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <CardTitle>QR Codes</CardTitle>
          <CardDescription>
            {qrCodes.length} QR code{qrCodes.length !== 1 ? "s" : ""} &middot;{" "}
            {scannedCount} scanned &middot;{" "}
            {qrCodes.length > 0
              ? `${((scannedCount / qrCodes.length) * 100).toFixed(0)}% check-in rate`
              : "0% check-in rate"}
          </CardDescription>
        </div>
        <CardContent>
          {qrCodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No QR codes generated for this purchase.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Scanned</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qrCodes.map((qr) => (
                  <TableRow key={qr.Id}>
                    <TableCell>{qr.Id}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">
                      {qr.BarcodeData}
                    </TableCell>
                    <TableCell>{userName(qr.Users)}</TableCell>
                    <TableCell>
                      {qr.IsScanned ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(qr.CreatedAt), "dd MMM yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {sharedTickets.length > 0 && (
        <Card>
          <div className="p-6">
            <CardTitle>Shared Tickets</CardTitle>
            <CardDescription>
              {sharedTickets.length} ticket
              {sharedTickets.length !== 1 ? "s" : ""} shared
            </CardDescription>
          </div>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shared By</TableHead>
                  <TableHead>Redeemed By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shared</TableHead>
                  <TableHead>Redeemed</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sharedTickets.map((st) => (
                  <TableRow key={st.Id}>
                    <TableCell>
                      {userName(st.Users_SharedTickets_SharedByUserIdToUsers)}
                    </TableCell>
                    <TableCell>
                      {userName(st.Users_SharedTickets_RedeemedByUserIdToUsers)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={shareStatusClass(st.Status)}
                      >
                        {shareStatusLabel(st.Status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(st.CreatedAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {st.RedeemedAt
                        ? format(new Date(st.RedeemedAt), "dd MMM yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(st.ExpiresAt), "dd MMM yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
