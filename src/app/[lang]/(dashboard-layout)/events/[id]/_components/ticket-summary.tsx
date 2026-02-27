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
}

export function TicketSummary({ tickets }: TicketSummaryProps) {
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

  return (
    <Card>
      <div className="p-6">
        <CardTitle>Tickets</CardTitle>
        <CardDescription>
          {totalSold} sold • {totalAvailable} available
        </CardDescription>
      </div>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Sales Period</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.Id}>
                <TableCell className="font-medium">{ticket.Name}</TableCell>
                <TableCell>
                  {ticket.IsFree ? "Free" : ticket.Price.toString()}
                </TableCell>
                <TableCell>
                  {ticket.AvailableTickets} / {ticket.TotalTickets}
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
