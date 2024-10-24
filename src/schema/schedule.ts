import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants"
import { timeToInt } from "@/lib/utils"
import { z } from "zod"

const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
const regexError = "Time must be in the format HH:MM"

export const scheduleFormSchema = z.object({
  timezone: z.string().min(1, "Required"),
  availabilities: z.array(z.object({
    startTime: z.string().regex(timeRegex, regexError),
    endTime: z.string().regex(timeRegex, regexError),
    dayOfWeek: z.enum(DAYS_OF_WEEK_IN_ORDER),
  })).superRefine((availabilities, contex) => {
    availabilities.forEach((availability, index) => {
      const overlaps = availabilities.some((_availability, _index) => {
        return (
          _index !== index && // unique availability objects
          _availability.dayOfWeek === availability.dayOfWeek && // same day
          timeToInt(_availability.startTime) < timeToInt(availability.endTime) &&
          timeToInt(_availability.endTime) > timeToInt(availability.startTime)
        ) 
      })

      if (overlaps) {
        contex.addIssue({
          code: "custom",
          message: "Availability overlaps with another",
          path: [index],
        })
      }

      // check that startTime is before endTime
      if (timeToInt(availability.startTime) >= timeToInt(availability.endTime)) {
        contex.addIssue({
          code: "custom",
          message: "End time must be after start time",
          path: [index],
        })
      }
    })
  })
})