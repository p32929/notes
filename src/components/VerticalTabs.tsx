import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { controller } from '@/lib/StatesController'
import { Button } from '@/components/ui/button'
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
import { Plus, FileText, X, Menu } from 'lucide-react'

const VerticalTabs: React.FC = () => {
  const states = useSelector(() => controller.states)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; noteId: string; title: string }>({ 
    isOpen: false, 
    noteId: '', 
    title: '' 
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
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

  const handleCreateNote = () => {
    const noteId = controller.createNote()
    controller.selectNote(noteId)
  }

  return (
    <TooltipProvider>
      <div className="w-12 bg-muted/20 border-r border-border flex flex-col h-full">
        {/* Hamburger Menu Button */}
        <div className="p-1 border-b border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full h-10 p-0 flex items-center justify-center"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Open Menu
            </TooltipContent>
          </Tooltip>
        </div>

        {/* New Note Button */}
        <div className="p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateNote}
                className="w-full h-10 p-0 flex items-center justify-center"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              New Note
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Notes Tabs */}
        <div className="flex-1 overflow-y-auto">
          {states.notes.map((note, index) => (
            <div key={note.id} className="relative group p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={states.selectedNoteId === note.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleNoteSelect(note.id)}
                    className={`
                      w-full h-10 p-0 flex items-center justify-center relative
                      ${states.selectedNoteId === note.id 
                        ? 'bg-primary/10 border-r-2 border-r-primary' 
                        : 'hover:bg-muted/50'
                      }
                    `}
                  >
                    <FileText className="h-4 w-4" />
                    {/* Note index */}
                    <span className="absolute -bottom-1 -right-1 text-[8px] bg-muted-foreground text-background rounded-full w-3 h-3 flex items-center justify-center">
                      {index + 1}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="max-w-xs">
                    <div className="font-medium">
                      {note.title || `Note ${index + 1}`}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {note.content ? (
                        (() => {
                          const div = document.createElement('div')
                          div.innerHTML = note.content
                          const text = div.textContent || div.innerText || ''
                          return text.slice(0, 100) + (text.length > 100 ? '...' : '')
                        })()
                      ) : (
                        'Empty note'
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
              
              {/* Delete Button - appears on hover */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDeleteNote(note.id, e)}
                className="absolute -top-0 -right-0 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-full"
              >
                <X className="h-2 w-2" />
              </Button>
            </div>
          ))}
        </div>

        {/* Full Menu Panel */}
        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed left-12 top-0 w-80 h-full bg-background border-r border-border z-50">
              {/* This would contain your full NotesPanel content */}
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-4">All Notes</h2>
                {states.notes.length === 0 ? (
                  <p className="text-muted-foreground">No notes yet</p>
                ) : (
                  <div className="space-y-2">
                    {states.notes.map((note, index) => (
                      <div
                        key={note.id}
                        onClick={() => {
                          handleNoteSelect(note.id)
                          setIsMenuOpen(false)
                        }}
                        className={`
                          p-3 rounded cursor-pointer transition-colors
                          ${states.selectedNoteId === note.id 
                            ? 'bg-primary/10 border-l-4 border-l-primary' 
                            : 'hover:bg-muted/50'
                          }
                        `}
                      >
                        <h3 className="font-medium">
                          {note.title || `Note ${index + 1}`}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(() => {
                            if (!note.content) return 'Empty note'
                            const div = document.createElement('div')
                            div.innerHTML = note.content
                            const text = div.textContent || div.innerText || ''
                            return text.slice(0, 50) + (text.length > 50 ? '...' : '')
                          })()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => 
          setDeleteDialog({ ...deleteDialog, isOpen: open })
        }>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Note</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this note? This action cannot be undone.
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
      </div>
    </TooltipProvider>
  )
}

export default VerticalTabs