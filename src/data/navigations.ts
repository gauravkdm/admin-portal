import type { NavigationType } from "@/types"

export const navigationsData: NavigationType[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/",
        iconName: "ChartPie",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Users",
        href: "/users",
        iconName: "Users",
      },
      {
        title: "Events",
        href: "/events",
        iconName: "Calendar",
      },
      {
        title: "Tickets",
        href: "/tickets",
        iconName: "Ticket",
      },
      {
        title: "Payouts",
        href: "/payouts",
        iconName: "CreditCard",
      },
    ],
  },
  {
    title: "Moderation",
    items: [
      {
        title: "Reports",
        href: "/reports",
        iconName: "ShieldAlert",
      },
      {
        title: "Contact Messages",
        href: "/contact",
        iconName: "MessageCircle",
      },
      {
        title: "Demo Requests",
        href: "/demos",
        iconName: "Presentation",
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        title: "Categories",
        href: "/content/categories",
        iconName: "Tag",
      },
      {
        title: "Hobbies",
        href: "/content/hobbies",
        iconName: "Heart",
      },
      {
        title: "Interests",
        href: "/content/interests",
        iconName: "Sparkles",
      },
      {
        title: "Languages",
        href: "/content/languages",
        iconName: "Globe",
      },
      {
        title: "Questions",
        href: "/content/questions",
        iconName: "CircleHelp",
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        title: "Analytics",
        href: "/analytics",
        iconName: "ChartBar",
      },
      {
        title: "Push Notifications",
        href: "/notifications",
        iconName: "Bell",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Request Logs",
        href: "/logs/requests",
        iconName: "FileText",
      },
      {
        title: "Exception Logs",
        href: "/logs/exceptions",
        iconName: "Bug",
      },
      {
        title: "SMS Logs",
        href: "/logs/sms",
        iconName: "Smartphone",
      },
    ],
  },
]
