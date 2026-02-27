import {
  Calendar,
  CreditCard,
  MessageCircle,
  ShieldAlert,
  Ticket,
  Users,
} from "lucide-react"

import { Card, CardTitle } from "@/components/ui/card"

interface OverviewStatsProps {
  totalUsers: number
  totalEvents: number
  totalTicketsSold: number
  totalRevenue: number
  pendingReports: number
  pendingContactMessages: number
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
  totalTicketsSold,
  totalRevenue,
  pendingReports,
  pendingContactMessages,
}: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Total Users"
        value={totalUsers.toLocaleString()}
        icon={Users}
      />
      <StatCard
        title="Total Events"
        value={totalEvents.toLocaleString()}
        icon={Calendar}
      />
      <StatCard
        title="Tickets Sold"
        value={totalTicketsSold.toLocaleString()}
        icon={Ticket}
      />
      <StatCard
        title="Total Revenue"
        value={`₹${totalRevenue.toLocaleString()}`}
        icon={CreditCard}
      />
      <StatCard
        title="Pending Reports"
        value={pendingReports}
        icon={ShieldAlert}
        description="Requires attention"
      />
      <StatCard
        title="Contact Messages"
        value={pendingContactMessages}
        icon={MessageCircle}
        description="Pending"
      />
    </div>
  )
}
