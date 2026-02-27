"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/prisma"

export async function updateReportStatus(
  reportId: number,
  status: string,
  adminNotes: string
) {
  await db.userReports.update({
    where: { Id: reportId },
    data: {
      Status: status,
      AdminNotes: adminNotes,
      ReviewedAt: new Date(),
    },
  })
  revalidatePath("/reports")
  revalidatePath("/[lang]/reports")
}
