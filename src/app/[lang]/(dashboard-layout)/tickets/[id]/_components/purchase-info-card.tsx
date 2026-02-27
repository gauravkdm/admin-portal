"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Calendar, CreditCard, MapPin, Ticket, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface PurchaseInfoCardProps {
  purchase: {
    Id: number
    OrderId: string | null
    PaymentStatus: string | null
    TotalTickets: number
    CreatedAt: Date
    EventId: string
    Events: {
      Id: string
      Title: string
      City: string | null
      StartTime: Date
    } | null
  }
  buyer: {
    Id: string
    FirstName: string | null
    LastName: string | null
    Email: string | null
    PhoneNo: string | null
    ProfilePhotoCdnUrl1: string | null
  } | null
  ticketType: {
    Name: string
    IsFree: boolean
    TotalTickets: number
    AvailableTickets: number
    MaxTicketsPerUser: number
  } | null
  currencySymbol: string
}

function PaymentStatusBadge({ status }: { status: string | null }) {
  const cls = (() => {
    switch (status?.toLowerCase()) {
      case "captured":
        return "bg-green-100 text-green-800 border-green-200"
      case "created":
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
      case "refunded":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  })()

  return (
    <Badge variant="outline" className={cls}>
      {status || "Unknown"}
    </Badge>
  )
}

export function PurchaseInfoCard({
  purchase,
  buyer,
  ticketType,
}: PurchaseInfoCardProps) {
  const buyerName = buyer
    ? [buyer.FirstName, buyer.LastName].filter(Boolean).join(" ") || "Unknown"
    : "Unknown"

  return (
    <Card>
      <div className="p-6">
        <CardTitle>Purchase Details</CardTitle>
        <CardDescription>Order and buyer information</CardDescription>
      </div>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <PaymentStatusBadge status={purchase.PaymentStatus} />
          {ticketType && (
            <Badge variant="secondary">
              {ticketType.IsFree ? "Free" : "Paid"} Ticket
            </Badge>
          )}
        </div>

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-muted-foreground">Order ID</p>
              <p className="font-mono text-xs">{purchase.OrderId || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Ticket className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-muted-foreground">Ticket Type</p>
              <p>{ticketType?.Name || "Unknown"}</p>
              <p className="text-xs text-muted-foreground">
                {purchase.TotalTickets} ticket
                {purchase.TotalTickets !== 1 ? "s" : ""} purchased
                {ticketType && (
                  <> &middot; Max {ticketType.MaxTicketsPerUser} per user</>
                )}
              </p>
              {ticketType && (
                <p className="text-xs text-muted-foreground">
                  {ticketType.TotalTickets - ticketType.AvailableTickets} sold /{" "}
                  {ticketType.TotalTickets} total
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-muted-foreground">Buyer</p>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={buyer?.ProfilePhotoCdnUrl1 || undefined}
                    alt={buyerName}
                  />
                  <AvatarFallback className="text-xs">
                    {buyerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`../users/${buyer?.Id}`}
                    className="hover:underline font-medium"
                  >
                    {buyerName}
                  </Link>
                  {buyer?.Email && (
                    <p className="text-muted-foreground text-xs">
                      {buyer.Email}
                    </p>
                  )}
                  {buyer?.PhoneNo && (
                    <p className="text-muted-foreground text-xs">
                      {buyer.PhoneNo}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-muted-foreground">Event</p>
              <Link
                href={`../events/${purchase.EventId}`}
                className="hover:underline"
              >
                {purchase.Events?.Title || "Unknown"}
              </Link>
              {purchase.Events?.City && (
                <p className="text-xs text-muted-foreground">
                  {purchase.Events.City}
                </p>
              )}
              {purchase.Events?.StartTime && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(purchase.Events.StartTime), "PPp")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-muted-foreground">Purchased</p>
              <p>{format(new Date(purchase.CreatedAt), "PPp")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
