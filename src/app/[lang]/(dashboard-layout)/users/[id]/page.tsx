import { notFound } from "next/navigation"

import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { UserActions } from "./_components/user-actions"
import { UserActivity } from "./_components/user-activity"
import { UserProfile } from "./_components/user-profile"

export const metadata: Metadata = {
  title: "User Details",
}

async function getUser(id: string) {
  const user = await db.users.findUnique({
    where: { Id: id },
    include: {
      Timezones: true,
      UserDeviceTokens: {
        where: { IsActive: true },
        orderBy: { LastUsedAt: "desc" },
        take: 5,
      },
      EventRsvps: {
        orderBy: { CreatedAt: "desc" },
        take: 10,
        include: {
          Events: {
            select: { Id: true, Title: true, Status: true, StartTime: true },
          },
        },
      },
      Notifications: {
        orderBy: { CreatedAt: "desc" },
        take: 5,
      },
      UserTokens: { select: { Id: true } },
    },
  })

  if (!user) return null

  const [
    hostedEventsCount,
    rsvpCount,
    matchesCount,
    purchasedTicketsCount,
    userHobbies,
    userInterests,
    userLanguages,
  ] = await Promise.all([
    db.events.count({ where: { HostUserId: id } }),
    db.eventRsvps.count({ where: { UserId: id } }),
    db.eventMatches.count({
      where: { OR: [{ User1Id: id }, { User2Id: id }] },
    }),
    db.purchasedTickets.count({ where: { UserId: id } }),
    db.userHobbies.findMany({ where: { UserId: id } }).then(async (uh) =>
      uh.length
        ? db.hobbies.findMany({
            where: { Id: { in: uh.map((h) => h.HobbiesId) } },
          })
        : []
    ),
    db.userInterests.findMany({ where: { UserId: id } }).then(async (ui) =>
      ui.length
        ? db.interests.findMany({
            where: { Id: { in: ui.map((i) => i.InterestsId) } },
          })
        : []
    ),
    db.userLanguages.findMany({ where: { UserId: id } }).then(async (ul) =>
      ul.length
        ? db.languages.findMany({
            where: { Id: { in: ul.map((l) => l.LanguagesId) } },
          })
        : []
    ),
  ])

  return {
    ...user,
    hostedEventsCount,
    rsvpCount,
    matchesCount,
    purchasedTicketsCount,
    UserHobbies: userHobbies.map((h) => ({ Hobbies: h })),
    UserInterests: userInterests.map((i) => ({ Interests: i })),
    UserLanguages: userLanguages.map((l) => ({ Languages: l })),
  }
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser(id)

  if (!user) notFound()

  return (
    <section className="container p-4 space-y-6">
      <UserProfile user={user} />
      <div className="grid gap-6 md:grid-cols-2">
        <UserActivity user={user} />
        <UserActions user={user} />
      </div>
    </section>
  )
}
