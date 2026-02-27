"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/prisma"

export async function updateEventStatus(eventId: string, status: string) {
  await db.events.update({
    where: { Id: eventId },
    data: { Status: status, UpdatedAt: new Date() },
  })
  revalidatePath("/events")
  revalidatePath(`/events/${eventId}`)
}

export async function toggleEventPublish(
  eventId: string,
  isPublished: boolean
) {
  await db.events.update({
    where: { Id: eventId },
    data: { IsPublished: isPublished, UpdatedAt: new Date() },
  })
  revalidatePath("/events")
  revalidatePath(`/events/${eventId}`)
}

export async function deleteEvent(eventId: string) {
  await db.$transaction(async (tx) => {
    await tx.purchasedTickets.deleteMany({ where: { EventId: eventId } })
    await tx.eventPayouts.deleteMany({ where: { EventId: eventId } })
    await tx.eventRsvps.deleteMany({ where: { EventId: eventId } })
    await tx.tickets.deleteMany({ where: { EventId: eventId } })
    await tx.eventsMedia.deleteMany({ where: { EventId: eventId } })
    await tx.eventSections.deleteMany({ where: { EventId: eventId } })
    await tx.eventCategoryMappings.deleteMany({ where: { EventId: eventId } })
    await tx.events.delete({ where: { Id: eventId } })
  })
  revalidatePath("/events")
}
