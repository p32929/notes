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
  Share, 
  Download, 
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

  // Apply current theme
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

  if (!selectedNote) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile Header */}
        <div className="md:hidden border-b border-border p-4 bg-background">
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
              <span className="md:hidden">Tap the menu to view your notes, or create your first note to get started.</span>
              <span className="hidden md:inline">Select a note from the sidebar to start editing, or create a new note to get started.</span>
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
        
        {/* Mobile Footer */}
        <div className="md:hidden border-t border-border px-4 py-3 bg-muted/20">
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
      <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-2 sm:mr-4">
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
                className="text-lg sm:text-xl font-semibold border-0 px-0 focus-visible:ring-0"
                autoFocus
              />
            ) : (
              <h1 
                className="text-lg sm:text-xl font-semibold cursor-pointer hover:text-muted-foreground transition-colors line-clamp-2 sm:line-clamp-1"
                onClick={handleTitleEdit}
              >
                {selectedNote.title || 'Untitled Note'}
              </h1>
            )}
            
            {/* Note metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">
                  Updated {formatDistanceToNow(selectedNote.updatedAt, { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">
                  Created {format(selectedNote.createdAt, 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 touch-manipulation">
                  <Share className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Share note
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 touch-manipulation">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Download note
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive p-1.5 sm:p-2 touch-manipulation"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Delete note
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-2 sm:p-4 pt-16 md:pt-0">
        <RichTextEditor
          content={selectedNote.content}
          onChange={handleContentChange}
          placeholder="Start writing your note..."
          className="h-full"
          onEditorReady={setEditor}
        />
      </div>

      {/* Status bar */}
      <div className="border-t border-border px-2 sm:px-4 py-2 bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline">Auto-saved</span>
            <span className="sm:hidden">Saved</span>
            <span className="hidden sm:inline">Words: {getTextContent(selectedNote.content).split(/\s+/).filter(word => word.length > 0).length}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs">
              {getTextContent(selectedNote.content).length}/100k
            </span>
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