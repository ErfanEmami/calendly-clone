"use server"
import "server-only" // throw error not on server

import { eventFormSchema } from "@/schema/events"
import {z} from "zod"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/drizzle/db"
import { EventTable } from "@/drizzle/schema"
import { redirect } from "next/navigation"
import { and, eq } from "drizzle-orm"

export async function createEvent(unsafeData: z.infer<typeof eventFormSchema>): Promise<{error: string} | undefined> {
  const { userId } = auth()
  
  if (userId == null) {
    return { error: "No user."}
  }

  const { data, error } = eventFormSchema.safeParse(unsafeData)

  if (error) {
    return { error: error.toString()}
  }

  await db
    .insert(EventTable)
    .values({ ...data, clerkUserId: userId })

  redirect("/events")
}

export async function updateEvent(id: string, unsafeData: z.infer<typeof eventFormSchema>): Promise<{error: string} | undefined> {
  const { userId } = auth()
  
  if (userId == null) {
    return { error: "No user."}
  }

  const { data, error } = eventFormSchema.safeParse(unsafeData)

  if (error) {
    return { error: error.toString()}
  }

  const { rowCount } = await db
    .update(EventTable)
    .set({ ...data })
    .where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId)))

  if (rowCount === 0) {
    return { error: "No events updated." }
  }


  redirect("/events")
}

export async function deleteEvent(id: string): Promise<{error: string} | undefined> {
  const { userId } = auth()
  
  if (userId == null) {
    return { error: "No user."}
  }

  const { rowCount } = await db
    .delete(EventTable)
    .where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId)))

  if (rowCount === 0) {
    return { error: "No events deleted." }
  }


  redirect("/events")
}