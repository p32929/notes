import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { controller } from '@/lib/StatesController'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Search, 
  Trash, 
  SortAsc,
  SortDesc,
  Clock,
  Calendar,
  Type,
  Plus,
  Moon,
  Sun
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const NotesPanel: React.FC = () => {
  const states = useSelector(() => controller.states)
  const [searchQuery, setSearchQuery] = useState(states.searchQuery)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; noteId: string; title: string }>({ 
    isOpen: false, 
    noteId: '', 
    title: '' 
  })

  const filteredNotes = controller.getFilteredNotes()

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    controller.setSearchQuery(query)
  }

  const handleNoteSelect = (noteId: string) => {
    controller.selectNote(noteId)
  }

  const handleDeleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const note = states.notes.find(n => n.id === noteId)
    setDeleteDialog({ 
      isOpen: true, 
      noteId, 
      title: note?.title || 'Untitled' 
    })
  }

  const confirmDeleteNote = () => {
    controller.deleteNote(deleteDialog.noteId)
    setDeleteDialog({ isOpen: false, noteId: '', title: '' })
  }

  const handleThemeToggle = () => {
    const newTheme = states.theme === 'light' ? 'dark' : 'light'
    controller.setTheme(newTheme)
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const getPreviewText = (content: string) => {
    // Strip HTML tags for preview
    if (!content) return ''
    const div = document.createElement('div')
    div.innerHTML = content
    const text = div.textContent || div.innerText || ''
    return text.slice(0, 150) + (text.length > 150 ? '...' : '')
  }

  const getSortIcon = () => {
    switch (states.sortBy) {
      case 'title':
        return <Type className="h-4 w-4" />
      case 'createdAt':
        return <Calendar className="h-4 w-4" />
      case 'updatedAt':
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <TooltipProvider>
      <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg sm:text-xl">9Notes</h2>
          <div className="flex items-center gap-1 sm:gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleThemeToggle}
                >
                  {states.theme === 'dark' ? 
                    <Sun className="h-4 w-4" /> : 
                    <Moon className="h-4 w-4" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {states.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <Button 
          className="w-full mb-4 h-10 sm:h-9" 
          onClick={() => {
            const noteId = controller.createNote()
            controller.selectNote(noteId)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">New Note</span>
          <span className="sm:hidden">New</span>
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-end mt-3 gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const sortOptions = ['updatedAt', 'createdAt', 'title'] as const
                  const currentIndex = sortOptions.indexOf(states.sortBy)
                  const nextSort = sortOptions[(currentIndex + 1) % sortOptions.length]
                  controller.setStates({ sortBy: nextSort })
                }}
                className="p-1.5 sm:p-2"
              >
                {getSortIcon()}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Sort by {states.sortBy}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  controller.setStates({ 
                    sortOrder: states.sortOrder === 'asc' ? 'desc' : 'asc' 
                  })
                }}
                className="p-1.5 sm:p-2"
              >
                {states.sortOrder === 'asc' ? 
                  <SortAsc className="h-4 w-4" /> : 
                  <SortDesc className="h-4 w-4" />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {states.sortOrder === 'asc' ? 'Ascending' : 'Descending'} order
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Results count */}
        <div className="text-xs text-muted-foreground mt-2">
          {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          {states.searchQuery && ` for "${states.searchQuery}"`}
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="mb-4">
              {states.searchQuery ? (
                <>
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notes found for "{states.searchQuery}"</p>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 mx-auto mb-2 bg-muted rounded-lg flex items-center justify-center">
                    📝
                  </div>
                  <p>No notes yet</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div>
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={`
                  group cursor-pointer transition-colors hover:bg-muted/50 border-b p-3 sm:p-4
                  ${states.selectedNoteId === note.id ? 'bg-muted border-l-4 border-l-primary' : ''}
                  active:bg-muted/70
                `}
                onClick={() => handleNoteSelect(note.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {note.title || 'Untitled'}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm line-clamp-2">
                      {getPreviewText(note.content) || 'No content'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="text-destructive hover:text-destructive p-1.5 sm:p-2 touch-manipulation"
                        >
                          <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Delete note
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => 
        setDeleteDialog({ ...deleteDialog, isOpen: open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ isOpen: false, noteId: '', title: '' })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteNote}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default NotesPanel