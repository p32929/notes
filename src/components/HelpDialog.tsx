import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { getShortcutDisplay } from '../hooks/useKeyboardShortcuts'
import { Keyboard, Edit3, Trash2, Save, ChevronUp, ChevronDown, X, Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Code, Search } from 'lucide-react'

interface HelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ open, onOpenChange }) => {
  const globalShortcuts = [
    {
      key: 'cmd+k',
      description: 'Create new note',
      icon: <Edit3 className="w-4 h-4" />
    },
    {
      key: 'cmd+d',
      description: 'Delete current note',
      icon: <Trash2 className="w-4 h-4" />
    },
    {
      key: 'cmd+s',
      description: 'Save current note',
      icon: <Save className="w-4 h-4" />
    },
    {
      key: 'cmd+f',
      description: 'Open search dialog',
      icon: <Search className="w-4 h-4" />
    },
    {
      key: 'alt+arrowup',
      description: 'Select previous note',
      icon: <ChevronUp className="w-4 h-4" />
    },
    {
      key: 'alt+arrowdown',
      description: 'Select next note',
      icon: <ChevronDown className="w-4 h-4" />
    },
    {
      key: 'escape',
      description: 'Close dialogs',
      icon: <X className="w-4 h-4" />
    }
  ]

  const formattingShortcuts = [
    {
      key: 'cmd+b',
      description: 'Bold text',
      icon: <Bold className="w-4 h-4" />
    },
    {
      key: 'cmd+shift+i',
      description: 'Italic text',
      icon: <Italic className="w-4 h-4" />
    },
    {
      key: 'cmd+u',
      description: 'Underline text',
      icon: <Underline className="w-4 h-4" />
    },
    {
      key: 'cmd+shift+s',
      description: 'Strikethrough text',
      icon: <Strikethrough className="w-4 h-4" />
    },
    {
      key: 'cmd+1',
      description: 'Heading 1',
      icon: <Heading1 className="w-4 h-4" />
    },
    {
      key: 'cmd+2',
      description: 'Heading 2',
      icon: <Heading2 className="w-4 h-4" />
    },
    {
      key: 'cmd+3',
      description: 'Heading 3',
      icon: <Heading3 className="w-4 h-4" />
    },
    {
      key: 'cmd+shift+l',
      description: 'Bullet list',
      icon: <List className="w-4 h-4" />
    },
    {
      key: 'cmd+shift+o',
      description: 'Numbered list',
      icon: <ListOrdered className="w-4 h-4" />
    },
    {
      key: 'cmd+shift+c',
      description: 'Code block',
      icon: <Code className="w-4 h-4" />
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl h-[80vh] max-h-[700px] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Help & Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* App Overview */}
          <section>
            <h3 className="font-semibold text-lg mb-3">How to use 9Notes</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Click the <strong>+</strong> button or use <strong>{getShortcutDisplay('cmd+k')}</strong> to create a new note</p>
              <p>• Click on any note in the sidebar to select and edit it</p>
              <p>• Use the rich text editor with formatting buttons for headings, bold, italic, and more</p>
              <p>• Your notes are automatically saved as you type</p>
              <p>• Drag and drop notes in the sidebar to reorder them</p>
              <p>• Use the search bar to quickly find notes by title or content</p>
            </div>
          </section>

          {/* Global Keyboard Shortcuts */}
          <section>
            <h3 className="font-semibold text-lg mb-3">Global Shortcuts</h3>
            <div className="grid gap-2">
              {globalShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">
                      {shortcut.icon}
                    </div>
                    <span className="text-sm">{shortcut.description}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono bg-background px-2 py-1 rounded border">
                    {getShortcutDisplay(shortcut.key)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Text Formatting Shortcuts */}
          <section>
            <h3 className="font-semibold text-lg mb-3">Text Formatting (while editing)</h3>
            <div className="grid gap-2">
              {formattingShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">
                      {shortcut.icon}
                    </div>
                    <span className="text-sm">{shortcut.description}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono bg-background px-2 py-1 rounded border">
                    {getShortcutDisplay(shortcut.key)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="font-semibold text-lg mb-3">Tips</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Notes are automatically saved - no need to manually save</p>
              <p>• Use headings (H1, H2, H3) to organize your content</p>
              <p>• The word count is shown in the bottom status bar</p>
              <p>• You can use all standard text formatting options</p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}