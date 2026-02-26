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

export interface IHeading {
    id: string
    level: number
    text: string
    offset: number
}

export interface ISplitPane {
    id: string
    noteId: string | null
    children?: ISplitPane[]
    direction?: 'horizontal' | 'vertical'
    size?: number
}

export interface IStates {
    selectedTab: number
    tabs: string[]
    notes: INote[]
    selectedNoteId: string | null
    searchQuery: string
    sortBy: 'updatedAt' | 'createdAt' | 'title'
    sortOrder: 'asc' | 'desc'
    theme: 'light' | 'dark' | 'system'
    color?: string
    fontSize?: number
    isSplitView: boolean
    splitLayout: ISplitPane | null
    activePaneId: string | null
}

export class Controller {
    @state
    states: IStates = {
        selectedTab: 0,
        tabs: [""],
        notes: [],
        selectedNoteId: null,
        searchQuery: '',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        theme: 'system',
        color: 'blue',
        fontSize: 14,
        isSplitView: false,
        splitLayout: null,
        activePaneId: null
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

    @action
    toggleSplitView() {
        this.states.isSplitView = !this.states.isSplitView
        if (this.states.isSplitView && !this.states.splitLayout) {
            const paneId = `pane_${Date.now()}`
            this.states.splitLayout = {
                id: paneId,
                noteId: this.states.selectedNoteId,
                direction: 'horizontal',
                children: [
                    { id: `${paneId}_left`, noteId: this.states.selectedNoteId, size: 50 },
                    { id: `${paneId}_right`, noteId: null, size: 50 }
                ]
            }
            this.states.activePaneId = `${paneId}_left`
        }
    }

    @action
    setSplitLayout(layout: ISplitPane | null) {
        this.states.splitLayout = layout
    }

    @action
    setActivePane(paneId: string | null) {
        this.states.activePaneId = paneId
    }

    @action
    updatePaneNoteId(paneId: string, noteId: string | null) {
        if (!this.states.splitLayout) return
        const updatePane = (pane: ISplitPane): ISplitPane => {
            if (pane.id === paneId) {
                return { ...pane, noteId }
            }
            if (pane.children) {
                return { ...pane, children: pane.children.map(updatePane) }
            }
            return pane
        }
        this.states.splitLayout = updatePane(this.states.splitLayout)
    }

    @action
    splitPane(paneId: string, direction: 'horizontal' | 'vertical' = 'horizontal') {
        if (!this.states.splitLayout) return
        const newPaneId = `pane_${Date.now()}`
        const newPane: ISplitPane = {
            id: newPaneId,
            noteId: null,
            size: 50
        }
        const updatePane = (pane: ISplitPane): ISplitPane => {
            if (pane.id === paneId) {
                const existingSize = pane.size || 50
                return {
                    ...pane,
                    direction,
                    children: [
                        { ...pane, size: existingSize / 2 },
                        { ...newPane, size: existingSize / 2 }
                    ]
                }
            }
            if (pane.children) {
                return { ...pane, children: pane.children.map(updatePane) }
            }
            return pane
        }
        this.states.splitLayout = updatePane(this.states.splitLayout)
    }

    @action
    closePane(paneId: string) {
        if (!this.states.splitLayout) return
        const removePane = (pane: ISplitPane): ISplitPane | null => {
            if (pane.children) {
                const newChildren = pane.children
                    .map(child => removePane(child))
                    .filter((child): child is ISplitPane => child !== null)
                if (newChildren.length === 1) {
                    return { ...newChildren[0], size: pane.size }
                }
                return { ...pane, children: newChildren }
            }
            if (pane.id === paneId) {
                return null
            }
            return pane
        }
        const newLayout = removePane(this.states.splitLayout)
        if (newLayout) {
            this.states.splitLayout = newLayout
        } else {
            this.states.isSplitView = false
            this.states.splitLayout = null
        }
    }

    @action
    swapPanes(paneId1: string, paneId2: string) {
        if (!this.states.splitLayout) return
        
        const swapInPane = (pane: ISplitPane): ISplitPane => {
            if (pane.children) {
                const index1 = pane.children.findIndex(child => child.id === paneId1)
                const index2 = pane.children.findIndex(child => child.id === paneId2)
                
                if (index1 !== -1 && index2 !== -1) {
                    const newChildren = [...pane.children]
                    const temp = newChildren[index1]
                    newChildren[index1] = newChildren[index2]
                    newChildren[index2] = temp
                    return { ...pane, children: newChildren }
                }
                return { ...pane, children: pane.children.map(swapInPane) }
            }
            return pane
        }
        this.states.splitLayout = swapInPane(this.states.splitLayout)
    }

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