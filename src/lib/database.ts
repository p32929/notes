import Dexie, { Table } from 'dexie'

export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface TrashNote extends Note {
  deletedAt: Date
}

export interface AppSettings {
  id: number
  theme: 'light' | 'dark' | 'system'
  color: string
  selectedNoteId: string | null
}

export class NotesDatabase extends Dexie {
  notes!: Table<Note>
  trash!: Table<TrashNote>
  settings!: Table<AppSettings>

  constructor() {
    super('NotesDatabase')
    this.version(2).stores({
      notes: 'id, title, content, createdAt, updatedAt',
      trash: 'id, title, content, createdAt, updatedAt, deletedAt',
      settings: '++id, theme, color, selectedNoteId'
    })
  }
}

export const db = new NotesDatabase()

// Storage interface to maintain compatibility with existing code
export class DatabaseStorage {
  async getNotes(): Promise<Note[]> {
    try {
      const notes = await db.notes.orderBy('updatedAt').reverse().toArray()
      return notes
    } catch (error) {
      console.error('Failed to get notes from IndexedDB:', error)
      // Fallback to localStorage
      return this.getNotesFromLocalStorage()
    }
  }

  async saveNotes(notes: Note[]): Promise<void> {
    try {
      await db.notes.clear()
      await db.notes.bulkAdd(notes)
    } catch (error) {
      console.error('Failed to save notes to IndexedDB:', error)
      // Fallback to localStorage
      this.saveNotesToLocalStorage(notes)
    }
  }

  // Optimized method to save only one note
  async saveNote(note: Note): Promise<void> {
    try {
      await db.notes.put(note)  // Put updates existing or creates new
    } catch (error) {
      console.error('Failed to save note to IndexedDB:', error)
      // Fallback: save all notes
      const notes = await this.getNotes()
      const updatedNotes = notes.map(n => n.id === note.id ? note : n)
      if (!notes.find(n => n.id === note.id)) {
        updatedNotes.push(note)
      }
      this.saveNotesToLocalStorage(updatedNotes)
    }
  }

  async getTrash(): Promise<TrashNote[]> {
    try {
      const trash = await db.trash.orderBy('deletedAt').reverse().toArray()
      return trash
    } catch (error) {
      console.error('Failed to get trash from IndexedDB:', error)
      // Fallback to localStorage
      return this.getTrashFromLocalStorage()
    }
  }

  async saveTrash(trash: TrashNote[]): Promise<void> {
    try {
      await db.trash.clear()
      await db.trash.bulkAdd(trash)
    } catch (error) {
      console.error('Failed to save trash to IndexedDB:', error)
      // Fallback to localStorage
      this.saveTrashToLocalStorage(trash)
    }
  }

  async saveTrashNote(note: TrashNote): Promise<void> {
    try {
      await db.trash.put(note)
    } catch (error) {
      console.error('Failed to save trash note to IndexedDB:', error)
      // Fallback: save all trash
      const trash = await this.getTrash()
      const updatedTrash = trash.map(n => n.id === note.id ? note : n)
      if (!trash.find(n => n.id === note.id)) {
        updatedTrash.push(note)
      }
      this.saveTrashToLocalStorage(updatedTrash)
    }
  }

  async deleteTrashNote(id: string): Promise<void> {
    try {
      await db.trash.delete(id)
    } catch (error) {
      console.error('Failed to delete trash note from IndexedDB:', error)
      // Fallback: save all trash except the deleted one
      const trash = await this.getTrash()
      const updatedTrash = trash.filter(n => n.id !== id)
      this.saveTrashToLocalStorage(updatedTrash)
    }
  }

  async clearTrash(): Promise<void> {
    try {
      await db.trash.clear()
    } catch (error) {
      console.error('Failed to clear trash from IndexedDB:', error)
      // Fallback: save empty trash
      this.saveTrashToLocalStorage([])
    }
  }

  async getSettings(): Promise<AppSettings | null> {
    try {
      const settings = await db.settings.toArray()
      return settings.length > 0 ? settings[0] : null
    } catch (error) {
      console.error('Failed to get settings from IndexedDB:', error)
      // Fallback to localStorage
      return this.getSettingsFromLocalStorage()
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await db.settings.clear()
      await db.settings.add(settings)
    } catch (error) {
      console.error('Failed to save settings to IndexedDB:', error)
      // Fallback to localStorage
      this.saveSettingsToLocalStorage(settings)
    }
  }

  // Migration helper - move data from localStorage to IndexedDB
  async migrateFromLocalStorage(): Promise<void> {
    try {
      // Check if we already have data in IndexedDB
      const existingNotes = await db.notes.count()
      const existingTrash = await db.trash.count()
      const existingSettings = await db.settings.count()

      if (existingNotes === 0 && existingTrash === 0 && existingSettings === 0) {
        // Get data from localStorage
        const localStorageNotes = this.getNotesFromLocalStorage()
        const localStorageTrash = this.getTrashFromLocalStorage()
        const localStorageSettings = this.getSettingsFromLocalStorage()

        if (localStorageNotes.length > 0) {
          await this.saveNotes(localStorageNotes)
          console.log(`Migrated ${localStorageNotes.length} notes from localStorage to IndexedDB`)
        }

        if (localStorageTrash.length > 0) {
          await this.saveTrash(localStorageTrash)
          console.log(`Migrated ${localStorageTrash.length} trash notes from localStorage to IndexedDB`)
        }

        if (localStorageSettings) {
          await this.saveSettings(localStorageSettings)
          console.log('Migrated settings from localStorage to IndexedDB')
        }
      }
    } catch (error) {
      console.error('Migration from localStorage failed:', error)
    }
  }

  // Fallback methods for localStorage
  private getNotesFromLocalStorage(): Note[] {
    try {
      const stored = localStorage.getItem('notes')
      if (stored) {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed.map(note => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        })) : []
      }
      return []
    } catch (error) {
      console.error('Failed to get notes from localStorage:', error)
      return []
    }
  }

  private saveNotesToLocalStorage(notes: Note[]): void {
    try {
      localStorage.setItem('notes', JSON.stringify(notes))
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error)
    }
  }

  private getTrashFromLocalStorage(): TrashNote[] {
    try {
      const stored = localStorage.getItem('trash')
      if (stored) {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed.map(note => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          deletedAt: new Date(note.deletedAt)
        })) : []
      }
      return []
    } catch (error) {
      console.error('Failed to get trash from localStorage:', error)
      return []
    }
  }

  private saveTrashToLocalStorage(trash: TrashNote[]): void {
    try {
      localStorage.setItem('trash', JSON.stringify(trash))
    } catch (error) {
      console.error('Failed to save trash to localStorage:', error)
    }
  }

  private getSettingsFromLocalStorage(): AppSettings | null {
    try {
      const theme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system'
      const color = localStorage.getItem('color') || 'blue'
      const selectedNoteId = localStorage.getItem('selectedNoteId') || null
      
      return {
        id: 1,
        theme,
        color,
        selectedNoteId
      }
    } catch (error) {
      console.error('Failed to get settings from localStorage:', error)
      return null
    }
  }

  private saveSettingsToLocalStorage(settings: AppSettings): void {
    try {
      localStorage.setItem('theme', settings.theme)
      localStorage.setItem('color', settings.color)
      if (settings.selectedNoteId) {
        localStorage.setItem('selectedNoteId', settings.selectedNoteId)
      } else {
        localStorage.removeItem('selectedNoteId')
      }
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error)
    }
  }
}

export const storage = new DatabaseStorage()