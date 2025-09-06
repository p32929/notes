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

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierKey = isMac ? event.metaKey : event.ctrlKey

      // Build shortcut key string
      let shortcutKey = ''
      
      if (modifierKey) shortcutKey += 'cmd+'
      if (event.shiftKey) shortcutKey += 'shift+'
      if (event.altKey) shortcutKey += 'alt+'
      
      shortcutKey += event.key.toLowerCase()

      // Text formatting shortcuts that should only work when editing
      const textFormattingShortcuts = ['cmd+b', 'cmd+shift+i', 'cmd+shift+s', 'cmd+1', 'cmd+2', 'cmd+3', 'cmd+shift+l', 'cmd+shift+o', 'cmd+shift+c']
      
      // Navigation and global shortcuts that should work anywhere
      const globalShortcuts = ['cmd+k', 'cmd+d', 'cmd+s', 'cmd+f', 'alt+arrowup', 'alt+arrowdown', 'escape']
      
      // Don't trigger shortcuts if user is editing text (except for formatting shortcuts when editing, or global shortcuts)
      if (isEditing) {
        if (!textFormattingShortcuts.includes(shortcutKey) && !globalShortcuts.includes(shortcutKey)) {
          return
        }
      } else {
        // When not editing, don't allow text formatting shortcuts
        if (textFormattingShortcuts.includes(shortcutKey)) {
          return
        }
      }

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