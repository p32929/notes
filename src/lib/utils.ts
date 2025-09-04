import { controller } from "@/lib/StatesController"
import { storage } from "@/lib/database"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function saveData() {
  try {
    const states = controller.states
    
    // Save notes
    await storage.saveNotes(states.notes)
    
    // Save settings
    const settings = {
      id: 1,
      theme: states.theme,
      color: states.color,
      selectedNoteId: states.selectedNoteId
    }
    await storage.saveSettings(settings)
  } catch (error) {
    console.error('Failed to save data:', error)
  }
}

export async function getData() {
  try {
    // First, try to migrate data from localStorage if needed
    await storage.migrateFromLocalStorage()
    
    // Load notes and settings from IndexedDB
    const notes = await storage.getNotes()
    const settings = await storage.getSettings()
    
    const stateData = {
      notes: notes || [],
      theme: settings?.theme || 'system',
      color: settings?.color || 'blue',
      selectedNoteId: settings?.selectedNoteId || null
    }
    
    controller.setStates(stateData)
  } catch (error) {
    console.error('Failed to load data:', error)
    
    // Fallback to empty state if everything fails
    controller.setStates({
      notes: [],
      theme: 'system',
      color: 'blue',
      selectedNoteId: null
    })
  }
}