import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { CategoriesTable } from "./_components/categories-table"

export const metadata: Metadata = {
  title: "Event Categories",
}

export default async function CategoriesPage() {
  const categories = await db.eventCategories.findMany({
    orderBy: { Name: "asc" },
  })

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Event Categories</h1>
        <p className="text-muted-foreground">Manage event categories</p>
      </div>
      <CategoriesTable categories={categories} />
    </section>
  )
}
