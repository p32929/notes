import { useEffect } from 'react'

interface KeyboardShortcuts {
  [key: string]: () => void
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input or editor
      const target = event.target as HTMLElement
      const isEditing = target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true' ||
        (target.closest && target.closest('.ProseMirror'))
      )

      // Don't trigger shortcuts if user is editing text
      if (isEditing && !event.metaKey && !event.ctrlKey) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierKey = isMac ? event.metaKey : event.ctrlKey

      // Build shortcut key string
      let shortcutKey = ''
      
      if (modifierKey) shortcutKey += 'cmd+'
      if (event.shiftKey) shortcutKey += 'shift+'
      if (event.altKey) shortcutKey += 'alt+'
      
      shortcutKey += event.key.toLowerCase()

      // Execute shortcut if it exists
      if (shortcuts[shortcutKey]) {
        event.preventDefault()
        shortcuts[shortcutKey]()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Helper function to get display text for shortcuts
export const getShortcutDisplay = (shortcut: string): string => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const parts = shortcut.split('+')
  
  return parts.map(part => {
    switch (part) {
      case 'cmd':
        return isMac ? '⌘' : 'Ctrl'
      case 'shift':
        return isMac ? '⇧' : 'Shift'
      case 'alt':
        return isMac ? '⌥' : 'Alt'
      default:
        return part.toUpperCase()
    }
  }).join(isMac ? '' : '+')
}