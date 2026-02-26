import { controller } from "@/lib/StatesController";
import { useSelector } from "react-redux";
import { useEffect, useCallback, useState } from "react";
import React from "react";
import { getData, saveData } from "@/lib/utils";
import EditorPanel from "@/components/EditorPanel";
import VerticalTabs from "@/components/VerticalTabs";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SearchDialog } from "@/components/SearchDialog";
import SplitViewContainer from "@/components/SplitViewContainer";
import NoteSelectDialog from "@/components/NoteSelectDialog";
import { Button } from "@/components/ui/button";
import { Columns, PanelLeft } from "lucide-react";

function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number): T {
  let timeout: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  } as T;
}

function App() {
  const states = useSelector(() => controller.states);
  const debouncedUpdateData = useCallback(() => debounce(() => {
    saveData().catch(error => console.error('Auto-save failed:', error))
  }, 1000)(), []);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showNoteSelectDialog, setShowNoteSelectDialog] = useState(false);
  const [targetPaneId, setTargetPaneId] = useState<string | null>(null);

  useEffect(() => {
    debouncedUpdateData()
  }, [states, debouncedUpdateData])

  useEffect(() => {
    getData().catch(error => console.error('Failed to load data:', error))
  }, [])

  // Listen for custom events from child components
  useEffect(() => {
    const handleSearchDialog = () => {
      setShowSearchDialog(true)
    }

    window.addEventListener('triggerSearchDialog', handleSearchDialog)
    return () => window.removeEventListener('triggerSearchDialog', handleSearchDialog)
  }, [])

  // Keyboard shortcuts
  const shortcuts = {
    'cmd+k': () => {
      // Create new note
      const noteId = controller.createNote()
      controller.selectNote(noteId)
    },
    'cmd+d': () => {
      // Trigger delete dialog - dispatch custom event for EditorPanel to handle
      if (states.selectedNoteId) {
        const event = new CustomEvent('triggerDeleteDialog')
        window.dispatchEvent(event)
      }
    },
    'cmd+s': () => {
      // Manual save (though auto-save is already active)
      saveData().catch(error => console.error('Manual save failed:', error))
    },
    'cmd+f': () => {
      // Open search dialog
      setShowSearchDialog(true)
    },
    'escape': () => {
      // Close any open dialogs or menus
      if (showSearchDialog) {
        setShowSearchDialog(false)
      } else if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    },
    'alt+arrowup': () => {
      // Navigate to previous note
      const currentIndex = states.notes.findIndex(note => note.id === states.selectedNoteId)
      if (currentIndex > 0) {
        controller.selectNote(states.notes[currentIndex - 1].id)
      }
    },
    'alt+arrowdown': () => {
      // Navigate to next note
      const currentIndex = states.notes.findIndex(note => note.id === states.selectedNoteId)
      if (currentIndex < states.notes.length - 1) {
        controller.selectNote(states.notes[currentIndex + 1].id)
      }
    },
    'cmd+b': () => {
      // Bold text
      window.dispatchEvent(new CustomEvent('editorCommand', { detail: { command: 'toggleBold' } }))
    },
    'cmd+shift+i': () => {
      // Italic text
      window.dispatchEvent(new CustomEvent('editorCommand', { detail: { command: 'toggleItalic' } }))
    },
    'cmd+shift+s': () => {
      // Strikethrough text
      window.dispatchEvent(new CustomEvent('editorCommand', { detail: { command: 'toggleStrike' } }))
    },
    'cmd+1': () => {
      // Heading 1
      window.dispatchEvent(new CustomEvent('editorCommand', { detail: { command: 'toggleHeading', level: 1 } }))
    },
    'cmd+2': () => {
      // Heading 2
      window.dispatchEvent(new CustomEvent('editorCommand', { detail: { command: 'toggleHeading', level: 2 } }))
    },
    'cmd+3': () => {
      // Heading 3
      window.dispatchEvent(new CustomEvent('editorCommand', { detail: { command: 'toggleHeading', level: 3 } }))
    },
    'cmd+shift+l': () => {
      // Bullet list
      window.dispatchEvent(new CustomEvent('editorCommand', { detail: { command: 'toggleBulletList' } }))
    },
    'cmd+shift+o': () => {
      // Numbered list  
      window.dispatchEvent(new CustomEvent('editorCommand', { detail: { command: 'toggleOrderedList' } }))
    },
    'cmd+shift+c': () => {
      // Code block
      document.execCommand('formatBlock', false, 'pre')
    }
  }

  useKeyboardShortcuts(shortcuts)

  useEffect(() => {
    const handlePaneNoteSelect = (e: Event) => {
      const customEvent = e as CustomEvent<{ paneId: string }>
      setTargetPaneId(customEvent.detail.paneId)
      setShowNoteSelectDialog(true)
    }

    window.addEventListener('triggerPaneNoteSelect', handlePaneNoteSelect)
    return () => window.removeEventListener('triggerPaneNoteSelect', handlePaneNoteSelect)
  }, [])

  const handleNoteSelectForPane = (noteId: string) => {
    if (targetPaneId) {
      controller.openNoteInPane(targetPaneId, noteId)
    }
    setShowNoteSelectDialog(false)
    setTargetPaneId(null)
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      {/* Vertical Tabs Sidebar */}
      <VerticalTabs />

      {/* Editor Panel or Split View */}
      <div className="flex-1 min-w-0 flex flex-col relative">
        {/* Split View Toggle Button */}
        <div className="absolute top-2 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => controller.toggleSplitView()}
            className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border border-border shadow-sm"
            title={states.splitViewEnabled ? "Exit Split View" : "Enter Split View"}
          >
            {states.splitViewEnabled ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <Columns className="h-4 w-4" />
            )}
          </Button>
        </div>

        {states.splitViewEnabled && states.splitLayout ? (
          <SplitViewContainer layout={states.splitLayout} />
        ) : (
          <EditorPanel />
        )}
      </div>

      {/* Dialogs */}
      <SearchDialog 
        open={showSearchDialog} 
        onOpenChange={setShowSearchDialog} 
      />
      <NoteSelectDialog
        open={showNoteSelectDialog}
        onOpenChange={setShowNoteSelectDialog}
        onSelect={handleNoteSelectForPane}
      />
    </div>
  );
}

export default App;