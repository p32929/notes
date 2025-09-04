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
import { Plus, FileText, X, Menu, MoreHorizontal } from 'lucide-react'

const VerticalTabs: React.FC = () => {
  const states = useSelector(() => controller.states)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; noteId: string; title: string }>({ 
    isOpen: false, 
    noteId: '', 
    title: '' 
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Add/remove class to hide cursor when menu is open
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-overlay-active')
    } else {
      document.body.classList.remove('menu-overlay-active')
    }
    return () => document.body.classList.remove('menu-overlay-active')
  }, [isMenuOpen])
  
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
      <div className="w-14 bg-muted/30 border-r border-border/50 flex flex-col h-full backdrop-blur-sm">
        {/* Header Section */}
        <div className="p-2 space-y-2 border-b border-border/50">
          {/* Hamburger Menu Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full h-10 p-0 flex items-center justify-center hover:bg-primary/10 transition-all duration-200 group"
              >
                <Menu className="h-4 w-4 group-hover:text-primary transition-colors" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>All Notes</p>
            </TooltipContent>
          </Tooltip>

          {/* New Note Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateNote}
                className="w-full h-10 p-0 flex items-center justify-center hover:bg-primary/10 transition-all duration-200 group border border-dashed border-border/30 hover:border-primary/50"
              >
                <Plus className="h-4 w-4 group-hover:text-primary transition-colors" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>New Note</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Notes Tabs */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1">
          {states.notes.map((note, index) => (
            <div key={note.id} className="relative group px-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNoteSelect(note.id)}
                      className={`
                        relative w-full h-10 p-0 flex items-center justify-center transition-all duration-200 rounded-lg overflow-hidden
                        ${states.selectedNoteId === note.id 
                          ? 'bg-primary/15 text-primary border-2 border-primary/20 shadow-sm' 
                          : 'hover:bg-muted/50 border-2 border-transparent hover:border-border/30'
                        }
                      `}
                    >
                      <FileText 
                        className={`h-4 w-4 transition-all duration-300 ${
                          states.selectedNoteId === note.id 
                            ? 'text-primary group-hover:scale-75 group-hover:opacity-0' 
                            : ''
                        }`} 
                      />
                      
                      {/* Delete Button - only shows on hover when note is selected */}
                      {states.selectedNoteId === note.id && (
                        <X 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNote(note.id, e)
                          }}
                          className="absolute inset-0 m-auto h-4 w-4 text-red-500 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 cursor-pointer hover:text-red-600"
                        />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="max-w-xs">
                      <div className="font-medium">
                        {note.title || `Note ${index + 1}`}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 max-w-[200px]">
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
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="p-2 border-t border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 p-0 flex items-center justify-center hover:bg-muted/50 transition-all duration-200"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>More options</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Full Menu Panel - Overlay on top of everything */}
        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-[9999]"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed left-0 top-0 w-80 h-full bg-background border-r border-border z-[9999] shadow-xl">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">All Notes</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {states.notes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground">No notes yet</p>
                    <Button 
                      onClick={() => {
                        handleCreateNote()
                        setIsMenuOpen(false)
                      }}
                      className="mt-4"
                      size="sm"
                    >
                      Create your first note
                    </Button>
                  </div>
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
                          p-3 rounded-lg cursor-pointer transition-all duration-200 border
                          ${states.selectedNoteId === note.id 
                            ? 'bg-primary/10 border-primary/20 shadow-sm' 
                            : 'hover:bg-muted/50 border-transparent hover:border-border/30'
                          }
                        `}
                      >
                        <h3 className="font-medium truncate">
                          {note.title || `Note ${index + 1}`}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {(() => {
                            if (!note.content) return 'Empty note'
                            const div = document.createElement('div')
                            div.innerHTML = note.content
                            const text = div.textContent || div.innerText || ''
                            return text.slice(0, 100) + (text.length > 100 ? '...' : '')
                          })()}
                        </p>
                        <div className="text-xs text-muted-foreground/70 mt-2">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </div>
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