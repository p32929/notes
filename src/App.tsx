import { controller } from "@/lib/StatesController";
import { useSelector } from "react-redux";
import { useEffect, useCallback } from "react";
import React from "react";
import { getData, saveData } from "@/lib/utils";
import EditorPanel from "@/components/EditorPanel";
import VerticalTabs from "@/components/VerticalTabs";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

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
  const debouncedUpdateData = useCallback(() => debounce(saveData, 1000)(), []);

  useEffect(() => {
    debouncedUpdateData()
  }, [states, debouncedUpdateData])

  useEffect(() => {
    getData()
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
      saveData()
    },
    'cmd+shift+n': () => {
      // Create new note (alternative shortcut)
      const noteId = controller.createNote()
      controller.selectNote(noteId)
    },
    'escape': () => {
      // Close any open dialogs or menus (can be extended)
      // For now, just blur any focused element
      if (document.activeElement instanceof HTMLElement) {
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
      document.execCommand('bold')
    },
    'cmd+shift+i': () => {
      // Italic text
      document.execCommand('italic')
    },
    'cmd+u': () => {
      // Underline text
      document.execCommand('underline')
    },
    'cmd+shift+s': () => {
      // Strikethrough text
      document.execCommand('strikeThrough')
    },
    'cmd+1': () => {
      // Heading 1
      document.execCommand('formatBlock', false, 'h1')
    },
    'cmd+2': () => {
      // Heading 2
      document.execCommand('formatBlock', false, 'h2')
    },
    'cmd+3': () => {
      // Heading 3
      document.execCommand('formatBlock', false, 'h3')
    },
    'cmd+shift+l': () => {
      // Bullet list
      document.execCommand('insertUnorderedList')
    },
    'cmd+shift+o': () => {
      // Numbered list
      document.execCommand('insertOrderedList')
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

      {/* Editor Panel */}
      <div className="flex-1 min-w-0">
        <EditorPanel />
      </div>
    </div>
  );
}

export default App;