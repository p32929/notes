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
import { Plus, FileText, X, Menu, Settings, Upload, Download, Trash2, Sun, Moon, Monitor } from 'lucide-react'

const VerticalTabs: React.FC = () => {
  const states = useSelector(() => controller.states)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; noteId: string; title: string }>({ 
    isOpen: false, 
    noteId: '', 
    title: '' 
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)
  const [clearAllDialog, setClearAllDialog] = useState(false)

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

  const handleExportNotes = () => {
    const dataStr = JSON.stringify(states.notes, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `9notes-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setShowOptionsDialog(false)
  }

  const handleImportNotes = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const importedNotes = JSON.parse(e.target?.result as string)
            if (Array.isArray(importedNotes)) {
              importedNotes.forEach((note: any) => {
                if (note.title !== undefined && note.content !== undefined) {
                  const noteId = controller.createNote()
                  controller.updateNote(noteId, {
                    title: note.title,
                    content: note.content
                  })
                }
              })
            }
          } catch (error) {
            console.error('Error importing notes:', error)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
    setShowOptionsDialog(false)
  }

  const handleClearAllNotes = () => {
    setClearAllDialog(true)
    setShowOptionsDialog(false)
  }

  const confirmClearAllNotes = () => {
    // Delete all notes
    states.notes.forEach(note => {
      controller.deleteNote(note.id)
    })
    setClearAllDialog(false)
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
                className="w-full h-10 p-0 flex items-center justify-center hover:bg-primary/10 transition-all duration-200 group border border-dashed border-border/30 hover:border-primary/30"
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
        <div className="p-2 border-t border-border/50 relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOptionsDialog(true)}
                className="w-full h-8 p-0 flex items-center justify-center hover:bg-muted/50 transition-all duration-200"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
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

        <Dialog open={showOptionsDialog} onOpenChange={setShowOptionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Theme Settings</DialogTitle>
              <DialogDescription>
                Currently using {states.theme || 'system'} theme
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Theme Mode */}
              <div>
                <h3 className="text-sm font-medium mb-4">Theme Mode</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={states.theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => controller.updateSettings({ theme: 'system' })}
                    className="flex flex-col items-center gap-2 h-16"
                  >
                    <Monitor className="h-5 w-5" />
                    <span className="text-xs">System</span>
                  </Button>
                  <Button
                    variant={states.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => controller.updateSettings({ theme: 'light' })}
                    className="flex flex-col items-center gap-2 h-16"
                  >
                    <Sun className="h-5 w-5" />
                    <span className="text-xs">Light</span>
                  </Button>
                  <Button
                    variant={states.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => controller.updateSettings({ theme: 'dark' })}
                    className="flex flex-col items-center gap-2 h-16"
                  >
                    <Moon className="h-5 w-5" />
                    <span className="text-xs">Dark</span>
                  </Button>
                </div>
              </div>

              {/* Theme Color */}
              <div>
                <h3 className="text-sm font-medium mb-4">Theme Color</h3>
                <div className="flex gap-2 justify-center">
                  {[
                    { name: 'green', color: 'bg-green-500', value: 'green' },
                    { name: 'blue', color: 'bg-blue-500', value: 'blue' },
                    { name: 'red', color: 'bg-red-500', value: 'red' },
                    { name: 'purple', color: 'bg-purple-500', value: 'purple' },
                    { name: 'orange', color: 'bg-orange-500', value: 'orange' },
                    { name: 'teal', color: 'bg-teal-500', value: 'teal' },
                    { name: 'indigo', color: 'bg-indigo-500', value: 'indigo' },
                    { name: 'pink', color: 'bg-pink-500', value: 'pink' },
                  ].map((colorOption) => (
                    <button
                      key={colorOption.name}
                      onClick={() => controller.updateSettings({ color: colorOption.value })}
                      className={`w-9 h-9 rounded-full ${colorOption.color} relative hover:scale-110 transition-transform flex-shrink-0`}
                    >
                      {states.color === colorOption.value && (
                        <div className="absolute inset-0 rounded-full border-2 border-white flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Management */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium mb-3">Data Management</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleImportNotes}
                    className="w-full justify-start gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import Notes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportNotes}
                    className="w-full justify-start gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Notes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearAllNotes}
                    className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Notes
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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

        <Dialog open={clearAllDialog} onOpenChange={setClearAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear All Notes</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete all notes? This will permanently remove all {states.notes.length} note{states.notes.length !== 1 ? 's' : ''} and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setClearAllDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmClearAllNotes}
              >
                Clear All Notes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default VerticalTabs