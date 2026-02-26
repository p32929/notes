import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { controller } from '@/lib/StatesController'
import { FileText, X } from 'lucide-react'

interface NoteSelectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (noteId: string) => void
  excludeNoteIds?: string[]
}

const NoteSelectDialog: React.FC<NoteSelectDialogProps> = ({
  open,
  onOpenChange,
  onSelect,
  excludeNoteIds = []
}) => {
  const states = useSelector(() => controller.states)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const availableNotes = states.notes.filter(
    note => !excludeNoteIds.includes(note.id)
  )

  const filteredNotes = React.useMemo(() => {
    let result = availableNotes

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(note =>
        note.title.toLowerCase().includes(query)
      )
    }

    return result.sort((a, b) => b.updatedAt - a.updatedAt)
  }, [searchQuery, availableNotes])

  useEffect(() => {
    if (open) {
      setSearchQuery('')
      setSelectedIndex(0)
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredNotes.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && filteredNotes.length > 0) {
        e.preventDefault()
        handleSelectNote(filteredNotes[selectedIndex].id)
      } else if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, filteredNotes, selectedIndex])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredNotes.length])

  const handleSelectNote = (noteId: string) => {
    onSelect(noteId)
  }

  const handleCreateNewNote = () => {
    const noteId = controller.createNote()
    onSelect(noteId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-xl max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Select Note to Open
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-shrink-0 mb-4">
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateNewNote}
              className="w-full"
            >
              + Create New Note
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="text-center text-muted-foreground mt-8">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notes found</p>
                <p className="text-sm mt-2">Try a different search or create a new note</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredNotes.map((note, index) => (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note.id)}
                    className={`p-3 rounded-md border cursor-pointer transition-all ${
                      index === selectedIndex
                        ? 'bg-primary/10 border-primary/30'
                        : 'hover:bg-muted/50 border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {note.title || 'Untitled Note'}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Updated {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NoteSelectDialog
