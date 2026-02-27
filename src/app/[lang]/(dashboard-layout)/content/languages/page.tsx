import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { LanguagesTable } from "./_components/languages-table"

export const metadata: Metadata = {
  title: "Languages",
}

export default async function LanguagesPage() {
  const languages = await db.languages.findMany({
    orderBy: { Name: "asc" },
  })

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Languages</h1>
        <p className="text-muted-foreground">Manage languages list</p>
      </div>
      <LanguagesTable languages={languages} />
    </section>
  )
}
