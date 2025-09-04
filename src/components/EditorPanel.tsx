import React, { useState, useEffect } from 'react'
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
import RichTextEditor from './RichTextEditor'
import { 
  Trash, 
  Edit3,
  Calendar,
  Clock,
  FileText
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

const EditorPanel: React.FC = () => {
  const states = useSelector(() => controller.states)
  const selectedNote = states.notes.find(note => note.id === states.selectedNoteId)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [editor, setEditor] = useState<any>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)

  // Apply current theme and color
  useEffect(() => {
    if (states.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (states.theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // System theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [states.theme])

  // Apply color theme
  useEffect(() => {
    if (states.color) {
      document.documentElement.setAttribute('data-color', states.color)
    }
  }, [states.color])

  if (!selectedNote) {
    return (
      <div className="flex-1 flex flex-col bg-background h-full">
        {/* Header */}
        <div className="border-b border-border p-4 bg-background">
          <h1 className="text-xl font-semibold text-center">9Notes</h1>
        </div>
        
        {/* Welcome Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Edit3 className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Welcome to 9Notes</h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed">
              Tap the menu to view your notes, or create your first note to get started.
            </p>
            <Button 
              onClick={() => {
                const noteId = controller.createNote()
                controller.selectNote(noteId)
              }}
              className="w-full sm:w-auto"
              size="lg"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Create New Note
            </Button>
          </div>
        </div>
        
        {/* Footer - Fixed at bottom */}
        <div className="border-t border-border px-4 py-3 bg-muted/20">
          <div className="text-center text-xs text-muted-foreground">
            Start writing your thoughts and ideas
          </div>
        </div>
      </div>
    )
  }

  const handleTitleEdit = () => {
    setTitleValue(selectedNote.title)
    setIsEditingTitle(true)
  }

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      controller.updateNote(selectedNote.id, { title: titleValue.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleContentChange = (content: string) => {
    controller.updateNote(selectedNote.id, { content })
  }

  const handleDelete = () => {
    setDeleteDialog(true)
  }

  const confirmDelete = () => {
    controller.deleteNote(selectedNote.id)
    setDeleteDialog(false)
  }

  // Helper function to extract text content from HTML
  const getTextContent = (htmlContent: string): string => {
    if (!htmlContent) return ''
    const div = document.createElement('div')
    div.innerHTML = htmlContent
    return div.textContent || div.innerText || ''
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background">
      {/* Header - Compact */}
      <div className="border-b border-border p-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            {isEditingTitle ? (
              <Input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave()
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false)
                    setTitleValue('')
                  }
                }}
                className="text-base font-semibold border-0 px-0 focus-visible:ring-0"
                autoFocus
              />
            ) : (
              <div 
                className="flex items-center group cursor-pointer"
                onClick={handleTitleEdit}
              >
                <h1 className="text-base font-semibold hover:text-muted-foreground transition-colors truncate">
                  {selectedNote.title || 'Untitled Note'}
                </h1>
                <Edit3 className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
              </div>
            )}
            
            {/* Compact metadata */}
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>Updated {formatDistanceToNow(selectedNote.updatedAt, { addSuffix: true })}</span>
              <span>Created {format(selectedNote.createdAt, 'MMM d, yyyy')}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-600 p-1.5 touch-manipulation"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete note</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Editor - Takes up most space */}
      <div className="flex-1 overflow-hidden">
        <RichTextEditor
          content={selectedNote.content}
          onChange={handleContentChange}
          placeholder="Start writing your note..."
          className="h-full"
          onEditorReady={setEditor}
        />
      </div>

      {/* Status bar - Fixed at bottom */}
      <div className="border-t border-border px-4 py-1 bg-muted/20 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Auto-saved</span>
            <span>Words: {getTextContent(selectedNote.content).split(/\s+/).filter(word => word.length > 0).length}</span>
          </div>
          <div>
            <span>{getTextContent(selectedNote.content).length}/100k</span>
          </div>
        </div>
      </div>
      </div>

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedNote.title || 'Untitled'}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default EditorPanel