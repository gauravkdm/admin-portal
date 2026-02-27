import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { HobbiesTable } from "./_components/hobbies-table"

export const metadata: Metadata = {
  title: "Hobbies",
}

export default async function HobbiesPage() {
  const hobbies = await db.hobbies.findMany({
    orderBy: { Name: "asc" },
  })

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Hobbies</h1>
        <p className="text-muted-foreground">Manage hobbies list</p>
      </div>
      <HobbiesTable hobbies={hobbies} />
    </section>
  )
}
