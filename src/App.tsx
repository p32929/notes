import { controller } from "@/lib/StatesController";
import { useSelector } from "react-redux";
import { useEffect, useCallback, useState } from "react";
import React from "react";
import { getData, saveData } from "@/lib/utils";
import EditorPanel from "@/components/EditorPanel";
import VerticalTabs from "@/components/VerticalTabs";
import SplitView, { SplitViewToggle } from "@/components/SplitView";
import OutlinePanel from "@/components/OutlinePanel";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SearchDialog } from "@/components/SearchDialog";
import { cn } from "@/lib/utils";

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
  const [showOutline, setShowOutline] = useState(false);

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
    'cmd+\\': () => {
      // Toggle Split View
      controller.toggleSplitView()
    },
    'cmd+shift+o': () => {
      // Toggle Outline Panel
      setShowOutline(prev => !prev)
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
    'cmd+shift+n': () => {
      // Numbered list  
      window.dispatchEvent(new CustomEvent('editorCommand', { detail: { command: 'toggleOrderedList' } }))
    },
    'cmd+shift+c': () => {
      // Code block
      document.execCommand('formatBlock', false, 'pre')
    }
  }

  useKeyboardShortcuts(shortcuts)

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Vertical Tabs Sidebar */}
      <VerticalTabs />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar with Split View Toggle */}
        <div className="h-10 border-b border-border flex items-center justify-between px-3 bg-muted/20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {states.isSplitView ? 'Split View' : 'Single View'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Outline Toggle */}
            <button
              onClick={() => setShowOutline(!showOutline)}
              className={cn(
                "h-8 px-2 text-xs font-medium rounded-md transition-colors",
                showOutline
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground"
              )}
            >
              Outline
            </button>
            {/* Split View Toggle */}
            <SplitViewToggle />
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-w-0 flex overflow-hidden">
          {/* Outline Panel (可选) */}
          {showOutline && (
            <OutlinePanel
              noteId={states.selectedNoteId}
              className="w-56 flex-shrink-0"
            />
          )}

          {/* Editor Content */}
          <div className="flex-1 min-w-0">
            {states.isSplitView ? (
              <SplitView />
            ) : (
              <EditorPanel />
            )}
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <SearchDialog
        open={showSearchDialog}
        onOpenChange={setShowSearchDialog}
      />
    </div>
  );
}

export default App;
