"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/prisma"

export async function updateContactStatus(
  id: number,
  status: string,
  adminNotes: string
) {
  await db.contactMessages.update({
    where: { Id: id },
    data: {
      Status: status,
      AdminNotes: adminNotes,
      UpdatedAt: new Date(),
    },
  })
  revalidatePath("/contact")
  revalidatePath("/[lang]/contact")
}
