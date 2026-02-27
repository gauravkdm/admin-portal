import type { Metadata } from "next"

import { db } from "@/lib/prisma"

import { QuestionsTable } from "./_components/questions-table"

export const metadata: Metadata = {
  title: "Profile Questions",
}

export default async function QuestionsPage() {
  const questions = await db.questions.findMany({
    orderBy: { DisplayOrder: "asc" },
  })

  return (
    <section className="container p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Profile Questions</h1>
        <p className="text-muted-foreground">Manage user profile questions</p>
      </div>
      <QuestionsTable questions={questions} />
    </section>
  )
}
