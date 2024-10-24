import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// helps with comparing times
// ex: 23:52 -> 23.52
export function timeToInt(time: string) {
  return parseFloat(time.replace(":", "."))
}

