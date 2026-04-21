import { controller } from "@/lib/StatesController"
import { storage } from "@/lib/database"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Store previous states to detect changes
let previousStates: any = null

export async function saveData() {
  try {
    const states = controller.states
    
    // If this is the first save or a bulk operation, save everything
    if (!previousStates) {
      await storage.saveNotes(states.notes)
      await storage.saveTrash(states.trash)
      await saveSettings(states)
      previousStates = JSON.parse(JSON.stringify(states)) // Deep copy
      return
    }
    
    // Check if settings changed
    const settingsChanged = 
      states.theme !== previousStates.theme ||
      states.color !== previousStates.color ||
      states.selectedNoteId !== previousStates.selectedNoteId ||
      states.selectedTrashNoteId !== previousStates.selectedTrashNoteId ||
      states.isTrashView !== previousStates.isTrashView
    
    if (settingsChanged) {
      await saveSettings(states)
    }
    
    // Check if notes array structure changed (added/removed notes)
    if (states.notes.length !== previousStates.notes.length) {
      await storage.saveNotes(states.notes)
    } else {
      // Check for individual note changes
      for (const note of states.notes) {
        const prevNote = previousStates.notes.find((n: any) => n.id === note.id)
        if (!prevNote || 
            note.title !== prevNote.title || 
            note.content !== prevNote.content ||
            note.updatedAt !== prevNote.updatedAt) {
          // Only save this specific note
          await storage.saveNote(note)
        }
      }
    }
    
    // Check if trash array structure changed (added/removed from trash)
    if (states.trash.length !== previousStates.trash.length) {
      await storage.saveTrash(states.trash)
    } else {
      // Check for individual trash note changes
      for (const note of states.trash) {
        const prevNote = previousStates.trash.find((n: any) => n.id === note.id)
        if (!prevNote || 
            note.title !== prevNote.title || 
            note.content !== prevNote.content ||
            note.deletedAt !== prevNote.deletedAt) {
          // Only save this specific trash note
          await storage.saveTrashNote(note)
        }
      }
    }
    
    // Update previous states
    previousStates = JSON.parse(JSON.stringify(states))
  } catch (error) {
    console.error('Failed to save data:', error)
  }
}

async function saveSettings(states: any) {
  const settings = {
    id: 1,
    theme: states.theme,
    color: states.color,
    selectedNoteId: states.selectedNoteId
  }
  await storage.saveSettings(settings)
}

export async function getData() {
  try {
    // First, try to migrate data from localStorage if needed
    await storage.migrateFromLocalStorage()
    
    // Load notes, trash, and settings from IndexedDB
    const notes = await storage.getNotes()
    const trash = await storage.getTrash()
    const settings = await storage.getSettings()
    
    // Convert Date objects to timestamps for state consistency
    const notesWithTimestamps = notes.map(note => ({
      ...note,
      createdAt: note.createdAt instanceof Date ? note.createdAt.getTime() : note.createdAt,
      updatedAt: note.updatedAt instanceof Date ? note.updatedAt.getTime() : note.updatedAt
    }))
    
    const trashWithTimestamps = trash.map(note => ({
      ...note,
      createdAt: note.createdAt instanceof Date ? note.createdAt.getTime() : note.createdAt,
      updatedAt: note.updatedAt instanceof Date ? note.updatedAt.getTime() : note.updatedAt,
      deletedAt: note.deletedAt instanceof Date ? note.deletedAt.getTime() : note.deletedAt
    }))
    
    const stateData = {
      notes: notesWithTimestamps || [],
      trash: trashWithTimestamps || [],
      theme: settings?.theme || 'system',
      color: settings?.color || 'blue',
      selectedNoteId: settings?.selectedNoteId || null,
      selectedTrashNoteId: null,
      isTrashView: false
    }
    
    controller.setStates(stateData)
  } catch (error) {
    console.error('Failed to load data:', error)
    
    // Fallback to empty state if everything fails
    controller.setStates({
      notes: [],
      trash: [],
      theme: 'system',
      color: 'blue',
      selectedNoteId: null,
      selectedTrashNoteId: null,
      isTrashView: false
    })
  }
}