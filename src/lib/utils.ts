import { controller } from "@/lib/StatesController"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const NOTE_STORAGE = "NOTE_STORAGE"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function saveData() {
  // console.log(`utils.ts :: saveData :: `)
  localStorage.setItem(NOTE_STORAGE, JSON.stringify(controller.states))
}

export function getData() {
  // console.log(`utils.ts :: getData :: `)
  const jsonStr = localStorage.getItem(NOTE_STORAGE) ?? "[]"
  const data = JSON.parse(jsonStr)
  controller.setStates(data)
}