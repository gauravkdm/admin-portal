"use client"

import { format } from "date-fns"

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

interface Ticket {
  Id: number
  Name: string
  Price: { toString: () => string }
  TotalTickets: number
  AvailableTickets: number
  IsFree: boolean
  IsExpired: boolean
  SaleStartTime: Date
  SaleEndTime: Date
}

interface TicketSummaryProps {
  tickets: Ticket[]
  ticketRevenueMap?: Map<number, { revenue: number; sold: number }>
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function TicketSummary({
  tickets,
  ticketRevenueMap,
}: TicketSummaryProps) {
  if (tickets.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <CardTitle>Tickets</CardTitle>
          <CardDescription>
            No tickets configured for this event
          </CardDescription>
        </div>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add tickets in the main app to sell admission.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalAvailable = tickets.reduce((sum, t) => sum + t.AvailableTickets, 0)
  const totalSold = tickets.reduce(
    (sum, t) => sum + (t.TotalTickets - t.AvailableTickets),
    0
  )
  const totalRevenue = ticketRevenueMap
    ? Array.from(ticketRevenueMap.values()).reduce(
        (sum, r) => sum + r.revenue,
        0
      )
    : 0

  return (
    <Card>
      <div className="p-6">
        <CardTitle>Tickets</CardTitle>
        <CardDescription>
          {totalSold} sold &middot; {totalAvailable} available
          {totalRevenue > 0 && ` · ${formatCurrency(totalRevenue)} revenue`}
        </CardDescription>
      </div>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Sales Period</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => {
              const revenueData = ticketRevenueMap?.get(ticket.Id)
              const sold = ticket.TotalTickets - ticket.AvailableTickets

              return (
                <TableRow key={ticket.Id}>
                  <TableCell className="font-medium">{ticket.Name}</TableCell>
                  <TableCell>
                    {ticket.IsFree ? "Free" : ticket.Price.toString()}
                  </TableCell>
                  <TableCell>{sold}</TableCell>
                  <TableCell>
                    {ticket.AvailableTickets} / {ticket.TotalTickets}
                  </TableCell>
                  <TableCell>
                    {ticket.IsFree
                      ? "—"
                      : formatCurrency(revenueData?.revenue ?? 0)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ticket.SaleStartTime), "PP")} –{" "}
                    {format(new Date(ticket.SaleEndTime), "PP")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        ticket.IsExpired
                          ? "text-muted-foreground"
                          : "text-green-600"
                      }
                    >
                      {ticket.IsExpired ? "Expired" : "Active"}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
