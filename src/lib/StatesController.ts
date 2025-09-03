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
    folderId: string
    tags: string[]
    isFavorite: boolean
    isArchived: boolean
}

export interface IFolder {
    id: string
    name: string
    color: string
    parentId: string | null
    createdAt: number
}

export interface IStates {
    selectedTab: number
    tabs: string[]
    // New enhanced state structure
    notes: INote[]
    folders: IFolder[]
    selectedNoteId: string | null
    selectedFolderId: string
    searchQuery: string
    viewMode: 'grid' | 'list'
    sortBy: 'updatedAt' | 'createdAt' | 'title'
    sortOrder: 'asc' | 'desc'
    theme: 'light' | 'dark' | 'system'
    showFavorites: boolean
    showArchived: boolean
}

export class Controller {
    @state
    states: IStates = {
        // Legacy support
        selectedTab: 0,
        tabs: [""],
        
        // New enhanced state
        notes: [],
        folders: [
            {
                id: 'default',
                name: 'All Notes',
                color: '#6366f1',
                parentId: null,
                createdAt: Date.now()
            }
        ],
        selectedNoteId: null,
        selectedFolderId: 'default',
        searchQuery: '',
        viewMode: 'list',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        theme: 'system',
        showFavorites: false,
        showArchived: false
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

    createNote(title: string = 'Untitled Note', folderId: string = 'default'): string {
        const newNote: INote = {
            id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            title,
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            folderId,
            tags: [],
            isFavorite: false,
            isArchived: false
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
    private _createFolderAction(folder: IFolder) {
        this.states.folders.push(folder)
    }

    createFolder(name: string, parentId: string | null = null, color: string = '#6366f1'): string {
        const newFolder: IFolder = {
            id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            name,
            color,
            parentId,
            createdAt: Date.now()
        }
        this._createFolderAction(newFolder)
        return newFolder.id
    }

    @action
    updateFolder(id: string, updates: Partial<IFolder>) {
        const folderIndex = this.states.folders.findIndex(folder => folder.id === id)
        if (folderIndex !== -1) {
            this.states.folders[folderIndex] = {
                ...this.states.folders[folderIndex],
                ...updates
            }
        }
    }

    @action
    deleteFolder(id: string) {
        // Move notes to default folder
        this.states.notes.forEach(note => {
            if (note.folderId === id) {
                note.folderId = 'default'
            }
        })
        this.states.folders = this.states.folders.filter(folder => folder.id !== id)
        if (this.states.selectedFolderId === id) {
            this.states.selectedFolderId = 'default'
        }
    }

    @action
    selectNote(id: string | null) {
        this.states.selectedNoteId = id
    }

    @action
    selectFolder(id: string) {
        this.states.selectedFolderId = id
    }

    @action
    toggleFavorite(id: string) {
        const note = this.states.notes.find(note => note.id === id)
        if (note) {
            note.isFavorite = !note.isFavorite
            note.updatedAt = Date.now()
        }
    }

    @action
    toggleArchive(id: string) {
        const note = this.states.notes.find(note => note.id === id)
        if (note) {
            note.isArchived = !note.isArchived
            note.updatedAt = Date.now()
        }
    }

    @action
    setSearchQuery(query: string) {
        this.states.searchQuery = query
    }

    @action
    setTheme(theme: 'light' | 'dark' | 'system') {
        this.states.theme = theme
    }


    // Utility methods for filtering
    getFilteredNotes() {
        let notes = [...this.states.notes]

        // Filter by folder
        if (this.states.selectedFolderId !== 'default') {
            notes = notes.filter(note => note.folderId === this.states.selectedFolderId)
        }

        // Filter by search query
        if (this.states.searchQuery) {
            const query = this.states.searchQuery.toLowerCase()
            notes = notes.filter(note => 
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query) ||
                note.tags.some(tag => tag.toLowerCase().includes(query))
            )
        }

        // Filter by favorites
        if (this.states.showFavorites) {
            notes = notes.filter(note => note.isFavorite)
        }

        // Filter archived
        if (!this.states.showArchived) {
            notes = notes.filter(note => !note.isArchived)
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