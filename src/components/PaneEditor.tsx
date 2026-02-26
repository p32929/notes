import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { controller, ISplitPane } from '@/lib/StatesController'
import TabHeader from './TabHeader'
import RichTextEditor from './RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit3, Columns, Rows } from 'lucide-react'

interface PaneEditorProps {
  pane: ISplitPane
}

const PaneEditor: React.FC<PaneEditorProps> = ({ pane }) => {
  const states = useSelector(() => controller.states)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')

  if (pane.type !== 'pane') {
    return null
  }

  const activeTab = pane.tabs?.find(tab => tab.id === pane.activeTabId)
  const activeNote = activeTab
    ? states.notes.find(note => note.id === activeTab.noteId)
    : null

  const handleTitleEdit = () => {
    if (activeNote) {
      setTitleValue(activeNote.title)
      setIsEditingTitle(true)
    }
  }

  const handleTitleSave = () => {
    if (activeNote && titleValue.trim()) {
      controller.updateNote(activeNote.id, { title: titleValue.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleContentChange = useCallback(
    (content: string) => {
      if (activeNote) {
        controller.updateNote(activeNote.id, { content })
      }
    },
    [activeNote?.id]
  )

  const handleSplitHorizontal = () => {
    controller.splitPane(pane.id, 'horizontal')
  }

  const handleSplitVertical = () => {
    controller.splitPane(pane.id, 'vertical')
  }

  if (!activeNote) {
    return (
      <div className="flex flex-col h-full bg-background">
        <TabHeader
          paneId={pane.id}
          tabs={pane.tabs || []}
          activeTabId={pane.activeTabId}
          notes={states.notes}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Edit3 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Note Open</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Click the + button above to open a note in this pane
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  const noteId = controller.createNote()
                  controller.openNoteInPane(pane.id, noteId)
                }}
                size="sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <TabHeader
        paneId={pane.id}
        tabs={pane.tabs || []}
        activeTabId={pane.activeTabId}
        notes={states.notes}
      />

      <div className="border-b border-border p-2 flex-shrink-0 flex items-center justify-between">
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
              className="text-sm font-semibold border-0 px-0 focus-visible:ring-0"
              autoFocus
            />
          ) : (
            <div
              className="flex items-center group cursor-pointer"
              onClick={handleTitleEdit}
            >
              <h1 className="text-sm font-semibold hover:text-muted-foreground transition-colors truncate">
                {activeNote.title || 'Untitled Note'}
              </h1>
              <Edit3 className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSplitHorizontal}
            className="h-7 w-7 p-0"
            title="Split Horizontally"
          >
            <Columns className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSplitVertical}
            className="h-7 w-7 p-0"
            title="Split Vertically"
          >
            <Rows className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <RichTextEditor
          content={activeNote.content}
          onChange={handleContentChange}
          placeholder="Start writing your note..."
          className="h-full"
        />
      </div>
    </div>
  )
}

export default PaneEditor
