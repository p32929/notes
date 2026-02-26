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

// Split View 布局类型
export type LayoutDirection = 'horizontal' | 'vertical'

export interface ILayoutNode {
    id: string
    type: 'leaf' | 'split'
    direction?: LayoutDirection
    children?: ILayoutNode[]
    noteId?: string | null
    width?: number  // 百分比 (0-100)
    height?: number // 百分比 (0-100)
}

export interface IEditorTab {
    id: string
    noteId: string
    title: string
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
    // Split View state
    isSplitView: boolean
    layout: ILayoutNode
    activeEditorId: string  // 当前激活的编辑器ID
}

// 生成唯一ID
function generateId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// 创建默认叶子节点
function createLeafNode(noteId: string | null = null): ILayoutNode {
    return {
        id: generateId(),
        type: 'leaf',
        noteId
    }
}

// 创建默认布局
function createDefaultLayout(): ILayoutNode {
    return createLeafNode(null)
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
        fontSize: 14,
        // Split View state
        isSplitView: false,
        layout: createDefaultLayout(),
        activeEditorId: ''
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

    // ===== Split View Methods =====

    @action
    toggleSplitView() {
        const newIsSplitView = !this.states.isSplitView
        this.states.isSplitView = newIsSplitView

        if (newIsSplitView) {
            // 进入 Split View 模式，创建左右两栏布局
            const leftNode = createLeafNode(this.states.selectedNoteId)
            const rightNode = createLeafNode(null)
            this.states.activeEditorId = leftNode.id

            this.states.layout = {
                id: generateId(),
                type: 'split',
                direction: 'horizontal',
                children: [
                    { ...leftNode, width: 50 },
                    { ...rightNode, width: 50 }
                ]
            }
        } else {
            // 退出 Split View，恢复单栏布局
            this.states.layout = createDefaultLayout()
            this.states.activeEditorId = ''
        }
    }

    @action
    setSplitViewEnabled(enabled: boolean) {
        if (this.states.isSplitView !== enabled) {
            this.toggleSplitView()
        }
    }

    @action
    openNoteInEditor(editorId: string, noteId: string) {
        const updateNode = (node: ILayoutNode): ILayoutNode => {
            if (node.id === editorId) {
                return { ...node, noteId }
            }
            if (node.type === 'split' && node.children) {
                return {
                    ...node,
                    children: node.children.map(updateNode)
                }
            }
            return node
        }

        this.states.layout = updateNode(this.states.layout)
    }

    @action
    setActiveEditor(editorId: string) {
        this.states.activeEditorId = editorId
    }

    @action
    splitEditor(editorId: string, direction: LayoutDirection = 'horizontal') {
        const splitNode = (node: ILayoutNode): ILayoutNode => {
            if (node.id === editorId && node.type === 'leaf') {
                const newNode = createLeafNode(null)
                this.states.activeEditorId = newNode.id

                return {
                    id: generateId(),
                    type: 'split',
                    direction,
                    children: [
                        { ...node, width: 50, height: 50 },
                        { ...newNode, width: 50, height: 50 }
                    ]
                }
            }
            if (node.type === 'split' && node.children) {
                return {
                    ...node,
                    children: node.children.map(splitNode)
                }
            }
            return node
        }

        this.states.layout = splitNode(this.states.layout)
    }

    @action
    closeEditor(editorId: string) {
        // 找到父节点
        const findParent = (node: ILayoutNode, targetId: string): ILayoutNode | null => {
            if (node.type === 'split' && node.children) {
                for (const child of node.children) {
                    if (child.id === targetId) {
                        return node
                    }
                    const found = findParent(child, targetId)
                    if (found) return found
                }
            }
            return null
        }

        const parent = findParent(this.states.layout, editorId)
        if (parent && parent.children && parent.children.length === 2) {
            const remainingChild = parent.children.find(c => c.id !== editorId)
            if (remainingChild) {
                // 用剩余子节点替换父节点
                const replaceNode = (node: ILayoutNode): ILayoutNode => {
                    if (node.id === parent.id) {
                        return { ...remainingChild, id: generateId() }
                    }
                    if (node.type === 'split' && node.children) {
                        return {
                            ...node,
                            children: node.children.map(replaceNode)
                        }
                    }
                    return node
                }
                this.states.layout = replaceNode(this.states.layout)
                this.states.activeEditorId = remainingChild.id
            }
        } else if (this.states.layout.id === editorId) {
            // 如果关闭的是根节点（唯一编辑器），清空笔记但不删除节点
            this.states.layout = {
                ...this.states.layout,
                noteId: null
            }
            this.states.activeEditorId = this.states.layout.id
        }
    }

    @action
    swapEditors(fromEditorId: string, toEditorId: string) {
        // 交换两个编辑器的笔记
        let fromNoteId: string | null | undefined = undefined
        let toNoteId: string | null | undefined = undefined

        // 获取两个编辑器的笔记ID
        const findNoteId = (node: ILayoutNode, targetId: string): string | null | undefined => {
            if (node.id === targetId) {
                return node.noteId
            }
            if (node.type === 'split' && node.children) {
                for (const child of node.children) {
                    const found = findNoteId(child, targetId)
                    if (found !== undefined) return found
                }
            }
            return undefined
        }

        fromNoteId = findNoteId(this.states.layout, fromEditorId)
        toNoteId = findNoteId(this.states.layout, toEditorId)

        if (fromNoteId !== undefined && toNoteId !== undefined) {
            // 交换笔记
            const swapNotes = (node: ILayoutNode): ILayoutNode => {
                if (node.id === fromEditorId) {
                    return { ...node, noteId: toNoteId || null }
                }
                if (node.id === toEditorId) {
                    return { ...node, noteId: fromNoteId || null }
                }
                if (node.type === 'split' && node.children) {
                    return {
                        ...node,
                        children: node.children.map(swapNotes)
                    }
                }
                return node
            }

            this.states.layout = swapNotes(this.states.layout)
        }
    }

    @action
    updateLayout(layout: ILayoutNode) {
        this.states.layout = layout
    }

    @action
    moveEditorTab(fromEditorId: string, toEditorId: string) {
        let fromNoteId: string | null | undefined = null

        // 获取源编辑器的笔记ID
        const findNoteId = (node: ILayoutNode, targetId: string): string | null | undefined => {
            if (node.id === targetId) {
                return node.noteId
            }
            if (node.type === 'split' && node.children) {
                for (const child of node.children) {
                    const found = findNoteId(child, targetId)
                    if (found !== undefined) return found
                }
            }
            return undefined
        }

        fromNoteId = findNoteId(this.states.layout, fromEditorId)

        if (fromNoteId !== undefined) {
            // 清空源编辑器
            this.openNoteInEditor(fromEditorId, '')
            // 设置目标编辑器
            this.openNoteInEditor(toEditorId, fromNoteId || '')
        }
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