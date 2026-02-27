import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { InterestsTable } from "./_components/interests-table"

export const metadata: Metadata = {
  title: "Interests",
}

export default async function InterestsPage() {
  const interests = await db.interests.findMany({
    orderBy: { Name: "asc" },
  })

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Interests</h1>
        <p className="text-muted-foreground">Manage interests list</p>
      </div>
      <InterestsTable interests={interests} />
    </section>
  )
}
