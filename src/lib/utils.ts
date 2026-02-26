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
      await saveSettings(states)
      previousStates = JSON.parse(JSON.stringify(states)) // Deep copy
      return
    }
    
    // Check if settings changed
    const settingsChanged = 
      states.theme !== previousStates.theme ||
      states.color !== previousStates.color ||
      states.selectedNoteId !== previousStates.selectedNoteId ||
      states.isSplitView !== previousStates.isSplitView ||
      states.activePaneId !== previousStates.activePaneId ||
      JSON.stringify(states.splitLayout) !== JSON.stringify(previousStates.splitLayout)
    
    if (settingsChanged) {
      await saveSettings(states)
    }
    
    // Check if notes array structure changed (added/removed notes)
    if (states.notes.length !== previousStates.notes.length) {
      await storage.saveNotes(states.notes)
    } else {
      // Check for individual note changes
      for (const note of states.notes) {
        const prevNote = previousStates.notes.find(n => n.id === note.id)
        if (!prevNote || 
            note.title !== prevNote.title || 
            note.content !== prevNote.content ||
            note.updatedAt !== prevNote.updatedAt) {
          // Only save this specific note
          await storage.saveNote(note)
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
    selectedNoteId: states.selectedNoteId,
    isSplitView: states.isSplitView,
    splitLayout: states.splitLayout,
    activePaneId: states.activePaneId
  }
  await storage.saveSettings(settings)
}

export async function getData() {
  try {
    await storage.migrateFromLocalStorage()
    
    const notes = await storage.getNotes()
    const settings = await storage.getSettings()
    
    const stateData = {
      notes: notes || [],
      theme: settings?.theme || 'system',
      color: settings?.color || 'blue',
      selectedNoteId: settings?.selectedNoteId || null,
      isSplitView: settings?.isSplitView || false,
      splitLayout: settings?.splitLayout || null,
      activePaneId: settings?.activePaneId || null
    }
    
    controller.setStates(stateData)
  } catch (error) {
    console.error('Failed to load data:', error)
    
    controller.setStates({
      notes: [],
      theme: 'system',
      color: 'blue',
      selectedNoteId: null,
      isSplitView: false,
      splitLayout: null,
      activePaneId: null
    })
  }
}