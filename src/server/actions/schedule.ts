"use server"
import "server-only" // throw error not on server

import { scheduleFormSchema } from "@/schema/schedule"
import {z} from "zod"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/drizzle/db"
import { ScheduleAvailabilityTable, ScheduleTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { BatchItem } from "drizzle-orm/batch"

export async function saveSchedule(unsafeData: z.infer<typeof scheduleFormSchema>): Promise<{error: string} | undefined> {
  const { userId } = auth()
  
  if (userId == null) {
    return { error: "No user."}
  }

  const { data, error } = scheduleFormSchema.safeParse(unsafeData)

  if (error) {
    return { error: error.toString()}
  }

  const { availabilities, ...scheduleData } = data

  const [{ id: scheduleId }] = await db
    .insert(ScheduleTable)
    .values({ ...scheduleData, clerkUserId: userId })
    .onConflictDoUpdate({
      target: ScheduleTable.clerkUserId, // if record with matching userId exists, update data
      set: scheduleData,
    })
    .returning({ id: ScheduleTable.id })

    const statements: [BatchItem<"pg">] = [
      // deletes all schedule availabilities for user from db
      db
        .delete(ScheduleAvailabilityTable)
        .where(eq(ScheduleAvailabilityTable.scheduleId, scheduleId))
    ]

    if (availabilities.length > 0) {
      statements.push(db.insert(ScheduleAvailabilityTable).values(
        availabilities.map(availability =>({
          ...availability,
          scheduleId
        }))
      ))
    }

    await db.batch(statements)

  // redirect("/events")
}

// export async function updateEvent(id: string, unsafeData: z.infer<typeof scheduleFormSchema>): Promise<{error: string} | undefined> {
//   const { userId } = auth()
  
//   if (userId == null) {
//     return { error: "No user."}
//   }

//   const { data, error } = scheduleFormSchema.safeParse(unsafeData)

//   if (error) {
//     return { error: error.toString()}
//   }

//   const { rowCount } = await db
//     .update(ScheduleTable)
//     .set({ ...data })
//     .where(and(eq(ScheduleTable.id, id), eq(ScheduleTable.clerkUserId, userId)))

//   if (rowCount === 0) {
//     return { error: "No events updated." }
//   }


//   redirect("/events")
// }

// export async function deleteEvent(id: string): Promise<{error: string} | undefined> {
//   const { userId } = auth()
  
//   if (userId == null) {
//     return { error: "No user."}
//   }

//   const { rowCount } = await db
//     .delete(EventTable)
//     .where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId)))

//   if (rowCount === 0) {
//     return { error: "No events deleted." }
//   }


//   redirect("/events")
// }