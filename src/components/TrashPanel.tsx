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
import {
  Trash2,
  Undo2,
  FileText,
  Trash,
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

const TrashPanel: React.FC = () => {
  const states = useSelector(() => controller.states)
  const selectedTrashNote = states.trash.find(note => note.id === states.selectedTrashNoteId)
  const [restoreDialog, setRestoreDialog] = useState(false)
  const [permanentDeleteDialog, setPermanentDeleteDialog] = useState(false)
  const [emptyTrashDialog, setEmptyTrashDialog] = useState(false)
  const [noteToRestore, setNoteToRestore] = useState<string | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  const handleBack = () => {
    controller.setTrashView(false)
    controller.selectTrashNote(null)
  }

  const handleSelectTrashNote = (noteId: string) => {
    controller.selectTrashNote(noteId)
  }

  const handleRestore = (noteId: string) => {
    setNoteToRestore(noteId)
    setRestoreDialog(true)
  }

  const confirmRestore = () => {
    if (noteToRestore) {
      controller.restoreNote(noteToRestore)
    }
    setRestoreDialog(false)
    setNoteToRestore(null)
  }

  const handlePermanentDelete = (noteId: string) => {
    setNoteToDelete(noteId)
    setPermanentDeleteDialog(true)
  }

  const confirmPermanentDelete = () => {
    if (noteToDelete) {
      controller.permanentlyDeleteNote(noteToDelete)
    }
    setPermanentDeleteDialog(false)
    setNoteToDelete(null)
  }

  const handleEmptyTrash = () => {
    setEmptyTrashDialog(true)
  }

  const confirmEmptyTrash = () => {
    controller.emptyTrash()
    setEmptyTrashDialog(false)
  }

  const getNoteToRestoreInfo = () => {
    if (!noteToRestore) return null
    return states.trash.find(n => n.id === noteToRestore)
  }

  const getNoteToDeleteInfo = () => {
    if (!noteToDelete) return null
    return states.trash.find(n => n.id === noteToDelete)
  }

  const getTextContent = (htmlContent: string): string => {
    if (!htmlContent) return ''
    const div = document.createElement('div')
    div.innerHTML = htmlContent
    return div.textContent || div.innerText || ''
  }

  if (!selectedTrashNote) {
    return (
      <TooltipProvider>
        <div className="h-screen flex flex-col bg-background">
          {/* Header */}
          <div className="border-b border-border p-4 flex items-center gap-3 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Back to Notes</TooltipContent>
            </Tooltip>
            <div className="flex-1">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Trash
              </h1>
              <p className="text-sm text-muted-foreground">
                {states.trash.length} item{states.trash.length !== 1 ? 's' : ''} in trash
              </p>
            </div>
            {states.trash.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEmptyTrash}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Empty Trash
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Permanently delete all items</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Trash List */}
          <div className="flex-1 overflow-y-auto p-4">
            {states.trash.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Trash2 className="h-16 w-16 mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Trash is empty</h3>
                <p className="text-sm">Deleted notes will appear here</p>
              </div>
            ) : (
              <div className="space-y-2 max-w-2xl mx-auto">
                {controller.getFilteredTrash().map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleSelectTrashNote(note.id)}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all duration-200
                      ${states.selectedTrashNoteId === note.id 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'hover:bg-muted/50 border-border/50'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1 truncate">
                          {note.title || 'Untitled Note'}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          Deleted {formatDistanceToNow(note.deletedAt, { addSuffix: true })}
                        </p>
                        {note.content && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {getTextContent(note.content).slice(0, 150)}
                            {getTextContent(note.content).length > 150 ? '...' : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRestore(note.id)
                              }}
                              className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                            >
                              <Undo2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">Restore</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePermanentDelete(note.id)
                              }}
                              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">Delete permanently</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Restore Dialog */}
          <Dialog open={restoreDialog} onOpenChange={setRestoreDialog}>
            <DialogContent className="w-[95vw] max-w-md sm:w-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Undo2 className="h-5 w-5 text-green-600" />
                  Restore Note
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to restore "{getNoteToRestoreInfo()?.title || 'Untitled'}"?
                  This will move it back to your notes list.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setRestoreDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default"
                  onClick={confirmRestore}
                  className="bg-green-600 hover:bg-green-700"
                  autoFocus
                >
                  <Undo2 className="h-4 w-4 mr-2" />
                  Restore
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Permanent Delete Dialog */}
          <Dialog open={permanentDeleteDialog} onOpenChange={setPermanentDeleteDialog}>
            <DialogContent className="w-[95vw] max-w-md sm:w-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Permanently Delete Note
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to permanently delete "{getNoteToDeleteInfo()?.title || 'Untitled'}"?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setPermanentDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmPermanentDelete}
                  autoFocus
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Empty Trash Dialog */}
          <Dialog open={emptyTrashDialog} onOpenChange={setEmptyTrashDialog}>
            <DialogContent className="w-[95vw] max-w-md sm:w-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Empty Trash
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to permanently delete all {states.trash.length} 
                  item{states.trash.length !== 1 ? 's' : ''} in the trash?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setEmptyTrashDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmEmptyTrash}
                  autoFocus
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Empty Trash
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-border p-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => controller.selectTrashNote(null)}
                  className="p-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Back to Trash List</TooltipContent>
            </Tooltip>
            <div>
              <h1 className="text-base font-semibold">
                {selectedTrashNote.title || 'Untitled Note'}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created {format(selectedTrashNote.createdAt, 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Deleted {formatDistanceToNow(selectedTrashNote.deletedAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestore(selectedTrashNote.id)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20 p-1.5"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Restore Note</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePermanentDelete(selectedTrashNote.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Delete Permanently</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedTrashNote.content ? (
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedTrashNote.content }}
            />
          ) : (
            <div className="text-center text-muted-foreground mt-8">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>This note has no content</p>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="border-t border-border px-4 py-3 bg-muted/20 flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Read-only (in trash)</span>
              <span>Words: {getTextContent(selectedTrashNote.content).split(/\s+/).filter(word => word.length > 0).length}</span>
            </div>
            <div>
              <span>{getTextContent(selectedTrashNote.content).length}/100k</span>
            </div>
          </div>
        </div>

        {/* Restore Dialog */}
        <Dialog open={restoreDialog} onOpenChange={setRestoreDialog}>
          <DialogContent className="w-[95vw] max-w-md sm:w-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Undo2 className="h-5 w-5 text-green-600" />
                Restore Note
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to restore "{selectedTrashNote.title || 'Untitled'}"?
                This will move it back to your notes list.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setRestoreDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="default"
                onClick={confirmRestore}
                className="bg-green-600 hover:bg-green-700"
                autoFocus
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Restore
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permanent Delete Dialog */}
        <Dialog open={permanentDeleteDialog} onOpenChange={setPermanentDeleteDialog}>
          <DialogContent className="w-[95vw] max-w-md sm:w-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Permanently Delete Note
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete "{selectedTrashNote.title || 'Untitled'}"?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setPermanentDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmPermanentDelete}
                autoFocus
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default TrashPanel
