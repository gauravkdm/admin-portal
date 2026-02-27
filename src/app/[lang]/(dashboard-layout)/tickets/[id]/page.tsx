import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink } from "lucide-react"

import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { Button } from "@/components/ui/button"
import { FinancialBreakdown } from "./_components/financial-breakdown"
import { PurchaseInfoCard } from "./_components/purchase-info-card"
import { QrCodesTable } from "./_components/qr-codes-table"

export const metadata: Metadata = {
  title: "Ticket Purchase Details",
}

async function getPurchase(id: number) {
  const purchase = await db.purchasedTickets.findUnique({
    where: { Id: id },
    select: {
      Id: true,
      TicketId: true,
      UserId: true,
      CurrencyId: true,
      FeesPercentage: true,
      GstPercentage: true,
      FeesAmount: true,
      GstAmount: true,
      TotalTickets: true,
      TotalAmount: true,
      TotalAmountIncludingFees: true,
      PromoCodeId: true,
      PromoCodeDiscountAmount: true,
      OrderId: true,
      PaymentStatus: true,
      EventId: true,
      CreatedAt: true,
      UpdatedAt: true,
      Events: {
        select: { Id: true, Title: true, City: true, StartTime: true },
      },
      Currencies: { select: { Symbol: true, Code: true } },
    },
  })
  return purchase
}

async function getBuyer(userId: string) {
  return db.users.findUnique({
    where: { Id: userId },
    select: {
      Id: true,
      FirstName: true,
      LastName: true,
      Email: true,
      PhoneNo: true,
      ProfilePhotoCdnUrl1: true,
    },
  })
}

async function getTicketType(ticketId: number) {
  return db.tickets.findUnique({
    where: { Id: ticketId },
    select: {
      Id: true,
      Name: true,
      Description: true,
      Price: true,
      IsFree: true,
      TotalTickets: true,
      AvailableTickets: true,
      MaxTicketsPerUser: true,
    },
  })
}

async function getQrCodes(purchasedTicketId: number) {
  return db.purchasedTicketsQrs.findMany({
    where: { PurchasedTicketId: purchasedTicketId },
    select: {
      Id: true,
      BarcodeData: true,
      Type: true,
      IsScanned: true,
      CreatedAt: true,
      UserId: true,
      Users: {
        select: { FirstName: true, LastName: true },
      },
    },
    orderBy: { Id: "asc" },
  })
}

async function getSharedTickets(purchasedTicketId: number) {
  return db.sharedTickets.findMany({
    where: { PurchasedTicketId: purchasedTicketId },
    select: {
      Id: true,
      Status: true,
      ExpiresAt: true,
      RedeemedAt: true,
      CreatedAt: true,
      Users_SharedTickets_SharedByUserIdToUsers: {
        select: { FirstName: true, LastName: true },
      },
      Users_SharedTickets_RedeemedByUserIdToUsers: {
        select: { FirstName: true, LastName: true },
      },
    },
    orderBy: { CreatedAt: "desc" },
  })
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: rawId } = await params
  const id = parseInt(rawId)
  if (isNaN(id)) notFound()

  const purchase = await getPurchase(id)
  if (!purchase) notFound()

  const [buyer, ticketType, qrCodes, sharedTickets] = await Promise.all([
    getBuyer(purchase.UserId),
    getTicketType(purchase.TicketId),
    getQrCodes(purchase.Id),
    getSharedTickets(purchase.Id),
  ])

  const scannedCount = qrCodes.filter((q) => q.IsScanned).length
  const currencySymbol = purchase.Currencies?.Symbol ?? "₹"

  return (
    <section className="container p-4 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Purchase #{purchase.Id}</h1>
          <p className="text-muted-foreground">
            {purchase.OrderId || "No Order ID"} &middot;{" "}
            {purchase.Events?.Title || "Unknown Event"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {purchase.Events && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`https://www.nexumevents.com/event-detail/${purchase.EventId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 h-4 w-4" />
                View Event on Nexum
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PurchaseInfoCard
          purchase={purchase}
          buyer={buyer}
          ticketType={ticketType}
          currencySymbol={currencySymbol}
        />
        <FinancialBreakdown
          purchase={purchase}
          currencySymbol={currencySymbol}
        />
      </div>

      <QrCodesTable
        qrCodes={qrCodes}
        scannedCount={scannedCount}
        sharedTickets={sharedTickets}
      />
    </section>
  )
}
