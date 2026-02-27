"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/prisma"

export async function updateDemoStatus(
  id: number,
  status: string,
  adminNotes: string,
  scheduledDemoAt?: Date
) {
  const data: {
    Status: string
    AdminNotes: string
    UpdatedAt: Date
    ScheduledDemoAt?: Date
  } = {
    Status: status,
    AdminNotes: adminNotes,
    UpdatedAt: new Date(),
  }
  if (scheduledDemoAt !== undefined) {
    data.ScheduledDemoAt = scheduledDemoAt
  }
  await db.demoRequests.update({
    where: { Id: id },
    data,
  })
  revalidatePath("/demos")
  revalidatePath("/[lang]/demos")
}
