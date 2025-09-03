import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { controller } from '@/lib/StatesController'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center">
            <Edit3 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Welcome to 9Notes</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Select a note from the sidebar to start editing, or create a new note to get started.
          </p>
          <Button onClick={() => {
            const noteId = controller.createNote()
            controller.selectNote(noteId)
          }}>
            Create New Note
          </Button>
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
    if (window.confirm('Are you sure you want to delete this note?')) {
      controller.deleteNote(selectedNote.id)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
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
                className="text-xl font-semibold border-0 px-0 focus-visible:ring-0"
                autoFocus
              />
            ) : (
              <h1 
                className="text-xl font-semibold cursor-pointer hover:text-muted-foreground transition-colors"
                onClick={handleTitleEdit}
              >
                {selectedNote.title || 'Untitled Note'}
              </h1>
            )}
            
            {/* Note metadata */}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  Updated {formatDistanceToNow(selectedNote.updatedAt, { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Created {format(selectedNote.createdAt, 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>
                  {selectedNote.content.length} characters
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <RichTextEditor
          content={selectedNote.content}
          onChange={handleContentChange}
          placeholder="Start writing your note..."
          className="h-full"
          onEditorReady={setEditor}
        />
      </div>

      {/* Status bar */}
      <div className="border-t border-border px-4 py-2 bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Auto-saved</span>
            <span>Words: {selectedNote.content.split(/\s+/).filter(word => word.length > 0).length}</span>
            <span>Characters: {selectedNote.content.length}</span>
          </div>
          <div className="flex items-center gap-4">
            {editor?.storage?.characterCount && (
              <span>
                {editor.storage.characterCount.characters()}/100,000 characters
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorPanel