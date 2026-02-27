"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/prisma"

export async function updateUserVerification(
  userId: string,
  isVerified: boolean
) {
  await db.users.update({
    where: { Id: userId },
    data: { IsVerified: isVerified },
  })
  revalidatePath(`/users/${userId}`)
  revalidatePath("/users")
}

export async function deleteUserTokens(userId: string) {
  await db.userTokens.deleteMany({
    where: { UserId: userId },
  })
  revalidatePath(`/users/${userId}`)
}

export async function updateUserDetails(
  userId: string,
  data: {
    FirstName?: string
    LastName?: string
    Email?: string
    PhoneNo?: string
    Bio?: string
    Gender?: string
  }
) {
  await db.users.update({
    where: { Id: userId },
    data: { ...data, UpdatedAt: new Date() },
  })
  revalidatePath(`/users/${userId}`)
  revalidatePath("/users")
}

export async function deleteUser(userId: string) {
  await db.userTokens.deleteMany({ where: { UserId: userId } })
  await db.userDeviceTokens.deleteMany({ where: { UserId: userId } })
  await db.notifications.deleteMany({ where: { UserId: userId } })
  await db.userHobbies.deleteMany({ where: { UserId: userId } })
  await db.userInterests.deleteMany({ where: { UserId: userId } })
  await db.userLanguages.deleteMany({ where: { UserId: userId } })
  await db.userAnswers.deleteMany({ where: { UserId: userId } })
  await db.favouriteEvents.deleteMany({ where: { UserId: userId } })
  await db.eventRsvps.deleteMany({ where: { UserId: userId } })
  await db.users.delete({ where: { Id: userId } })
  revalidatePath("/users")
}
