import Link from "next/link"
import {
  Banknote,
  CalendarSearch,
  MessageCircle,
  ShieldAlert,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface ActionItemsProps {
  pendingReports: number
  pendingContactMessages: number
  pendingDemoRequests: number
  pendingPayouts: number
}

interface Item {
  count: number
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  linkText: string
}

export function ActionItems({
  pendingReports,
  pendingContactMessages,
  pendingDemoRequests,
  pendingPayouts,
}: ActionItemsProps) {
  const items: Item[] = [
    {
      count: pendingReports,
      icon: ShieldAlert,
      title: `${pendingReports} pending report${pendingReports !== 1 ? "s" : ""}`,
      description: "Unreviewed user reports need attention.",
      href: "/reports",
      linkText: "Review reports",
    },
    {
      count: pendingContactMessages,
      icon: MessageCircle,
      title: `${pendingContactMessages} contact message${pendingContactMessages !== 1 ? "s" : ""}`,
      description: "Unanswered contact messages.",
      href: "/contact",
      linkText: "View messages",
    },
    {
      count: pendingDemoRequests,
      icon: CalendarSearch,
      title: `${pendingDemoRequests} demo request${pendingDemoRequests !== 1 ? "s" : ""}`,
      description: "Demo requests awaiting response.",
      href: "/demos",
      linkText: "View requests",
    },
    {
      count: pendingPayouts,
      icon: Banknote,
      title: `${pendingPayouts} pending payout${pendingPayouts !== 1 ? "s" : ""}`,
      description: "Payouts waiting to be processed.",
      href: "/payouts",
      linkText: "View payouts",
    },
  ].filter((item) => item.count > 0)

  if (items.length === 0) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <Alert key={item.href}>
          <item.icon className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            {item.title}
            <Badge variant="secondary" className="text-xs">
              Action needed
            </Badge>
          </AlertTitle>
          <AlertDescription>
            {item.description}{" "}
            <Link href={item.href} className="font-medium underline">
              {item.linkText}
            </Link>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
