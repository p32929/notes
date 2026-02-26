import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { controller, ISplitPane } from '@/lib/StatesController'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import RichTextEditor from './RichTextEditor'
import OutlineNavigation from './OutlineNavigation'
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
  Trash, 
  Edit3,
  FileText,
  ChevronDown,
  X
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface SingleEditorPaneProps {
  pane: ISplitPane
  isActive: boolean
  onNoteSelect: (noteId: string) => void
  className?: string
}

export const SingleEditorPane: React.FC<SingleEditorPaneProps> = ({
  pane,
  isActive,
  onNoteSelect,
  className
}) => {
  const states = useSelector(() => controller.states)
  const note = states.notes.find(n => n.id === pane.noteId)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [editor, setEditor] = useState<any>(null)
  const [showNoteSelector, setShowNoteSelector] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [showOutline, setShowOutline] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (note && editor) {
      setTimeout(() => {
        try {
          if (editor.commands && editor.commands.focus) {
            editor.commands.focus()
          }
        } catch (error) {
          console.log('Could not focus editor:', error)
        }
      }, 100)
    }
  }, [note?.id, editor])

  if (!note) {
    return (
      <div className={cn('flex flex-col h-full bg-background', className)}>
        <div className="border-b border-border p-3 flex items-center justify-between">
          <span className="text-base text-muted-foreground">No note selected</span>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNoteSelector(!showNoteSelector)}
              className="h-9 text-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Select Note
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            {showNoteSelector && (
              <div className="absolute top-full right-0 mt-1 w-72 bg-background border border-border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                {states.notes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      onNoteSelect(n.id)
                      setShowNoteSelector(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 truncate"
                  >
                    {n.title || 'Untitled Note'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-3 opacity-50" />
            <p className="text-base">Select a note to view</p>
          </div>
        </div>
      </div>
    )
  }

  const handleTitleEdit = () => {
    setTitleValue(note.title)
    setIsEditingTitle(true)
  }

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      controller.updateNote(note.id, { title: titleValue.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleContentChange = (content: string) => {
    controller.updateNote(note.id, { content })
  }

  const handleDelete = () => {
    setDeleteDialog(true)
  }

  const confirmDelete = () => {
    controller.deleteNote(note.id)
    setDeleteDialog(false)
  }

  const getTextContent = (htmlContent: string): string => {
    if (!htmlContent) return ''
    const div = document.createElement('div')
    div.innerHTML = htmlContent
    return div.textContent || div.innerText || ''
  }

  return (
    <TooltipProvider>
      <div 
        ref={containerRef}
        className={cn(
          'flex flex-col h-full bg-background',
          isActive && 'ring-1 ring-primary/20',
          className
        )}
      >
        <div className="border-b border-border p-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4 min-w-0">
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
                  className="text-base font-semibold border-0 px-0 focus-visible:ring-0 h-auto"
                  autoFocus
                />
              ) : (
                <div 
                  className="flex items-center group cursor-pointer"
                  onClick={handleTitleEdit}
                >
                  <h2 className="text-base font-semibold hover:text-muted-foreground transition-colors truncate">
                    {note.title || 'Untitled Note'}
                  </h2>
                  <Edit3 className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground flex-shrink-0" />
                </div>
              )}
              <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                <span>Updated {formatDistanceToNow(note.updatedAt, { addSuffix: true })}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOutline(!showOutline)}
                    className="h-9 w-9 p-0"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle outline</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-600 h-9 w-9 p-0"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete note</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            <RichTextEditor
              content={note.content}
              onChange={handleContentChange}
              placeholder="Start writing your note..."
              className="h-full"
              onEditorReady={setEditor}
            />
          </div>
          
          {showOutline && (
            <div className="w-56 border-l border-border flex-shrink-0 overflow-y-auto">
              <OutlineNavigation 
                content={note.content} 
                editorRef={{ current: editor } as React.RefObject<any>}
              />
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-2 bg-muted/20 flex-shrink-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Auto-saved</span>
            <span>{getTextContent(note.content).length} chars</span>
          </div>
        </div>

        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Note</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{note.title || 'Untitled'}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default SingleEditorPane
