import { state, action, createStore } from 'usm-redux';
import { compose } from 'redux';

const composeEnhancers =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof window === "object" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Specify extension's options like name, actionsDenylist, actionsCreators, serialize...
        })
        : compose;

export interface INote {
    id: string
    title: string
    content: string
    createdAt: number
    updatedAt: number
}

export interface IStates {
    selectedTab: number
    tabs: string[]
    // Enhanced state structure
    notes: INote[]
    selectedNoteId: string | null
    searchQuery: string
    sortBy: 'updatedAt' | 'createdAt' | 'title'
    sortOrder: 'asc' | 'desc'
    theme: 'light' | 'dark' | 'system'
    color?: string
    fontSize?: number
}

export class Controller {
    @state
    states: IStates = {
        // Legacy support
        selectedTab: 0,
        tabs: [""],
        
        // Enhanced state
        notes: [],
        selectedNoteId: null,
        searchQuery: '',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        theme: 'system',
        color: 'blue',
        fontSize: 14
    }

    @action
    setStates(newStates: Partial<IStates>) {
        this.states = {
            ...this.states,
            ...newStates,
        }
    }

    // Legacy methods for backward compatibility
    @action
    setText(text: string) {
        if (this.states.tabs[this.states.selectedTab] !== undefined) {
            this.states.tabs[this.states.selectedTab] = text
        }
        // Also update current note if selected
        if (this.states.selectedNoteId) {
            const note = this.states.notes.find(n => n.id === this.states.selectedNoteId)
            if (note) {
                note.content = text
                note.updatedAt = Date.now()
            }
        }
    }

    @action
    deleteTab() {
        this.states.tabs = this.states.tabs.filter((_, index) => {
            return index !== this.states.selectedTab
        })
        if (this.states.selectedTab > 0) {
            this.states.selectedTab -= 1
        }
    }

    @action
    addTab() {
        this.states.tabs.splice(this.states.selectedTab + 1, 0, "");
        this.states.selectedTab += 1
    }

    // New enhanced methods
    @action
    private _createNoteAction(note: INote, selectIt: boolean = true) {
        this.states.notes.push(note)
        if (selectIt) {
            this.states.selectedNoteId = note.id
        }
    }

    createNote(title: string = 'Untitled Note'): string {
        const newNote: INote = {
            id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            title,
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        this._createNoteAction(newNote, true)
        return newNote.id
    }

    @action
    updateNote(id: string, updates: Partial<INote>) {
        const noteIndex = this.states.notes.findIndex(note => note.id === id)
        if (noteIndex !== -1) {
            this.states.notes[noteIndex] = {
                ...this.states.notes[noteIndex],
                ...updates,
                updatedAt: Date.now()
            }
        }
    }

    @action
    deleteNote(id: string) {
        this.states.notes = this.states.notes.filter(note => note.id !== id)
        if (this.states.selectedNoteId === id) {
            this.states.selectedNoteId = this.states.notes[0]?.id || null
        }
    }

    @action
    clearAllNotes() {
        this.states.notes = []
        this.states.selectedNoteId = null
    }

    @action
    selectNote(id: string | null) {
        this.states.selectedNoteId = id
    }

    @action
    setSearchQuery(query: string) {
        this.states.searchQuery = query
    }

    @action
    setTheme(theme: 'light' | 'dark' | 'system') {
        this.states.theme = theme
    }

    @action
    updateSettings(settings: { theme?: 'light' | 'dark' | 'system'; color?: string; fontSize?: number }) {
        if (settings.theme) {
            this.states.theme = settings.theme
        }
        if (settings.color) {
            this.states.color = settings.color
        }
        if (settings.fontSize) {
            this.states.fontSize = settings.fontSize
        }
    }

    @action
    reorderNotes(startIndex: number, endIndex: number) {
        const result = Array.from(this.states.notes)
        const [removed] = result.splice(startIndex, 1)
        result.splice(endIndex, 0, removed)
        this.states.notes = result
    }


    // Utility methods for filtering
    getFilteredNotes() {
        let notes = [...this.states.notes]

        // Filter by search query
        if (this.states.searchQuery) {
            const query = this.states.searchQuery.toLowerCase()
            notes = notes.filter(note => 
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query)
            )
        }

        // Sort notes
        notes.sort((a, b) => {
            const aValue = a[this.states.sortBy]
            const bValue = b[this.states.sortBy]
            
            if (this.states.sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
            }
        })

        return notes
    }
}

export const controller = new Controller();

export const store = createStore(
    {
        modules: [controller],
    },
    undefined,
    {
        reduxEnhancer: composeEnhancers(),
    }
);