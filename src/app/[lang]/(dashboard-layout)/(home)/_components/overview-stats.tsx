import {
  Banknote,
  Calendar,
  CheckCircle,
  CreditCard,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react"

import { Card, CardTitle } from "@/components/ui/card"

interface OverviewStatsProps {
  totalUsers: number
  totalEvents: number
  totalPurchases: number
  totalRevenue: number
  totalTicketsSold: number
  usersLast30d: number
  usersLast7d: number
  eventsLast30d: number
  purchasesLast7d: number
  checkInRate: number
  uniqueBuyers: number
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  description?: string
}) {
  return (
    <Card asChild>
      <article>
        <div className="flex justify-between p-6">
          <div>
            <CardTitle className="text-muted-foreground font-normal text-sm">
              {title}
            </CardTitle>
            <p className="text-2xl font-semibold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </article>
    </Card>
  )
}

export function OverviewStats({
  totalUsers,
  totalEvents,
  totalPurchases,
  totalRevenue,
  totalTicketsSold,
  usersLast30d,
  usersLast7d,
  eventsLast30d,
  purchasesLast7d,
  checkInRate,
  uniqueBuyers,
}: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={`₹${totalRevenue.toLocaleString()}`}
        icon={Banknote}
        description={`${totalTicketsSold.toLocaleString()} tickets sold`}
      />
      <StatCard
        title="Total Users"
        value={totalUsers.toLocaleString()}
        icon={Users}
        description={`+${usersLast7d} this week · +${usersLast30d} this month`}
      />
      <StatCard
        title="Total Events"
        value={totalEvents.toLocaleString()}
        icon={Calendar}
        description={`+${eventsLast30d} this month`}
      />
      <StatCard
        title="Ticket Purchases"
        value={totalPurchases.toLocaleString()}
        icon={Ticket}
        description={`+${purchasesLast7d} this week · ${uniqueBuyers.toLocaleString()} unique buyers`}
      />
      <StatCard
        title="Avg Order Value"
        value={`₹${totalPurchases > 0 ? Math.round(totalRevenue / totalPurchases).toLocaleString() : 0}`}
        icon={CreditCard}
        description="Per purchase"
      />
      <StatCard
        title="Revenue / Event"
        value={`₹${totalEvents > 0 ? Math.round(totalRevenue / totalEvents).toLocaleString() : 0}`}
        icon={TrendingUp}
        description="Average per event"
      />
      <StatCard
        title="Check-in Rate"
        value={`${checkInRate.toFixed(1)}%`}
        icon={CheckCircle}
        description="QR codes scanned"
      />
      <StatCard
        title="Conversion"
        value={`${totalUsers > 0 ? ((uniqueBuyers / totalUsers) * 100).toFixed(1) : 0}%`}
        icon={Users}
        description={`${uniqueBuyers} buyers out of ${totalUsers.toLocaleString()} users`}
      />
    </div>
  )
}
