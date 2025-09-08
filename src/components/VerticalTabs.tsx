import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { controller } from '@/lib/StatesController'
import { Button } from '@/components/ui/button'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TooltipWithShortcut, SimpleTooltip } from '@/components/ui/tooltip-with-shortcut'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, FileText, Settings, Upload, Download, Trash2, Sun, Moon, Monitor, GripVertical, HelpCircle, Search, CheckCircle, Github, ExternalLink } from 'lucide-react'
import { HelpDialog } from './HelpDialog'

interface SortableNoteProps {
  note: any
  index: number
  isSelected: boolean
  onSelect: (noteId: string) => void
}

const SortableNote: React.FC<SortableNoteProps> = ({ note, index, isSelected, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: note.id,
    // Configure sensor to allow both click and drag
    data: {
      type: 'note',
      note,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleClick = (e: React.MouseEvent) => {
    // Only select if it's a simple click, not a drag operation
    if (!isDragging) {
      onSelect(note.id)
    }
  }

  const noteTitle = note.title || `Note ${index + 1}`
  const noteDescription = note.content ? (
    (() => {
      const div = document.createElement('div')
      div.innerHTML = note.content
      const text = div.textContent || div.innerText || ''
      return text.slice(0, 100) + (text.length > 100 ? '...' : '')
    })()
  ) : 'Empty note'

  return (
    <div ref={setNodeRef} style={style} className="relative group px-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className={`
              relative w-full h-10 p-0 flex items-center justify-center transition-all duration-200 rounded-lg overflow-hidden cursor-pointer
              ${isSelected 
                ? 'bg-primary/15 text-primary border-2 border-primary/20 shadow-sm' 
                : 'hover:bg-muted/50 border-2 border-transparent hover:border-border/30'
              }
            `}
            style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
          >
            {/* Main file icon - scales down on hover to make room for drag icon */}
            <FileText 
              className={`h-4 w-4 transition-all duration-300 ${
                isSelected 
                  ? 'text-primary group-hover:scale-75 group-hover:opacity-0' 
                  : 'group-hover:scale-75 group-hover:opacity-0'
              }`} 
            />
            
            {/* Drag handle - shows on hover, replaces the file icon */}
            <GripVertical 
              className="absolute inset-0 m-auto h-4 w-4 text-muted-foreground opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="flex flex-col">
            <span className="font-medium text-white">{noteTitle}</span>
            <span className="text-xs text-white mt-1">{noteDescription}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

const VerticalTabs: React.FC = () => {
  const states = useSelector(() => controller.states)
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)
  const [clearAllDialog, setClearAllDialog] = useState(false)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const { isInstallable, isInstalled, installApp } = usePWAInstall()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = states.notes.findIndex((note) => note.id === active.id)
      const newIndex = states.notes.findIndex((note) => note.id === over?.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        controller.reorderNotes(oldIndex, newIndex)
      }
    }
  }

  
  const handleNoteSelect = (noteId: string) => {
    controller.selectNote(noteId)
  }


  const handleCreateNote = () => {
    const noteId = controller.createNote()
    controller.selectNote(noteId)
  }

  const handleOpenSearch = () => {
    // Dispatch custom event to open search dialog
    const event = new CustomEvent('triggerSearchDialog')
    window.dispatchEvent(event)
  }

  const handleExportNotes = () => {
    const dataStr = JSON.stringify(states.notes, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `9notes-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setShowOptionsDialog(false)
  }

  const handleImportNotes = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const importedNotes = JSON.parse(e.target?.result as string)
            if (Array.isArray(importedNotes)) {
              // Create all notes in batch to avoid multiple auto-saves
              const newNotes: any[] = []
              
              importedNotes.forEach((note: any) => {
                if (note.title !== undefined && note.content !== undefined) {
                  const noteId = controller.createNote()
                  controller.updateNote(noteId, {
                    title: note.title,
                    content: note.content,
                    // Preserve original timestamps if they exist
                    createdAt: note.createdAt ? new Date(note.createdAt) : undefined,
                    updatedAt: note.updatedAt ? new Date(note.updatedAt) : undefined
                  })
                }
              })
              
              console.log(`Successfully imported ${importedNotes.length} notes`)
            } else {
              console.error('Invalid file format: expected array of notes')
            }
          } catch (error) {
            console.error('Error importing notes:', error)
            alert('Failed to import notes. Please check the file format.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
    setShowOptionsDialog(false)
  }

  const handleClearAllNotes = () => {
    setClearAllDialog(true)
    setShowOptionsDialog(false)
  }

  const confirmClearAllNotes = () => {
    // Clear all notes efficiently - this will trigger a bulk save
    controller.clearAllNotes()
    setClearAllDialog(false)
  }

  return (
    <TooltipProvider>
      <div className="w-14 bg-muted/30 border-r border-border/50 flex flex-col h-full backdrop-blur-sm">
        {/* Header Section */}
        <div className="p-2 space-y-2 border-b border-border/50">
          {/* New Note Button */}
          <TooltipWithShortcut title="New Note" shortcut="cmd+k" side="right">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateNote}
              className="w-full h-11 sm:h-[52px] p-0 flex items-center justify-center hover:bg-primary/10 transition-all duration-200 group border border-dashed border-border/30 hover:border-primary/30"
            >
              <Plus className="h-4 w-4 group-hover:text-primary transition-colors" />
            </Button>
          </TooltipWithShortcut>
        </div>

        {/* Notes Tabs */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={states.notes.map(note => note.id)}
              strategy={verticalListSortingStrategy}
            >
              {states.notes.map((note, index) => (
                <SortableNote
                  key={note.id}
                  note={note}
                  index={index}
                  isSelected={states.selectedNoteId === note.id}
                  onSelect={handleNoteSelect}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Footer Section */}
        <div className="p-2 border-t border-border/50 relative space-y-2">
          <TooltipWithShortcut title="Search Notes" shortcut="cmd+f" side="right">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenSearch}
              className="w-full h-8 p-0 flex items-center justify-center hover:bg-muted/50 transition-all duration-200"
            >
              <Search className="h-4 w-4" />
            </Button>
          </TooltipWithShortcut>

          <SimpleTooltip title="Help" side="right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelpDialog(true)}
              className="w-full h-8 p-0 flex items-center justify-center hover:bg-muted/50 transition-all duration-200"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </SimpleTooltip>
          
          <SimpleTooltip title="Settings" side="right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOptionsDialog(true)}
              className="w-full h-8 p-0 flex items-center justify-center hover:bg-muted/50 transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </SimpleTooltip>

        </div>


        <Dialog open={showOptionsDialog} onOpenChange={setShowOptionsDialog}>
          <DialogContent className="w-[95vw] max-w-2xl h-[80vh] max-h-[600px] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Theme Settings</DialogTitle>
              <DialogDescription>
                Currently using {states.theme || 'system'} theme
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Theme Mode */}
              <div>
                <h3 className="text-sm font-medium mb-4">Theme Mode</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={states.theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => controller.updateSettings({ theme: 'system' })}
                    className="flex flex-col items-center gap-2 h-16"
                  >
                    <Monitor className="h-5 w-5" />
                    <span className="text-xs">System</span>
                  </Button>
                  <Button
                    variant={states.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => controller.updateSettings({ theme: 'light' })}
                    className="flex flex-col items-center gap-2 h-16"
                  >
                    <Sun className="h-5 w-5" />
                    <span className="text-xs">Light</span>
                  </Button>
                  <Button
                    variant={states.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => controller.updateSettings({ theme: 'dark' })}
                    className="flex flex-col items-center gap-2 h-16"
                  >
                    <Moon className="h-5 w-5" />
                    <span className="text-xs">Dark</span>
                  </Button>
                </div>
              </div>

              {/* Theme Color */}
              <div>
                <h3 className="text-sm font-medium mb-4">Theme Color</h3>
                <div className="flex gap-2 justify-center">
                  {[
                    { name: 'green', color: 'bg-green-500', value: 'green' },
                    { name: 'blue', color: 'bg-blue-500', value: 'blue' },
                    { name: 'red', color: 'bg-red-500', value: 'red' },
                    { name: 'purple', color: 'bg-purple-500', value: 'purple' },
                    { name: 'orange', color: 'bg-orange-500', value: 'orange' },
                    { name: 'teal', color: 'bg-teal-500', value: 'teal' },
                    { name: 'indigo', color: 'bg-indigo-500', value: 'indigo' },
                    { name: 'pink', color: 'bg-pink-500', value: 'pink' },
                  ].map((colorOption) => (
                    <button
                      key={colorOption.name}
                      onClick={() => controller.updateSettings({ color: colorOption.value })}
                      className={`w-9 h-9 rounded-full ${colorOption.color} relative hover:scale-110 transition-transform flex-shrink-0`}
                    >
                      {states.color === colorOption.value && (
                        <div className="absolute inset-0 rounded-full border-2 border-white flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Management */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium mb-3">Data Management</h3>
                <div className="space-y-2">
                  {isInstallable && (
                    <Button
                      onClick={installApp}
                      className="w-full justify-start gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Install App
                    </Button>
                  )}
                  {isInstalled && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      App installed
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleImportNotes}
                    className="w-full justify-start gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import Notes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportNotes}
                    className="w-full justify-start gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Notes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearAllNotes}
                    className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Notes
                  </Button>
                </div>
              </div>

              {/* About */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium mb-3">About</h3>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://github.com/p32929/notes', '_blank')}
                  className="w-full justify-start gap-2"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>


        <Dialog open={clearAllDialog} onOpenChange={setClearAllDialog}>
          <DialogContent className="w-[95vw] max-w-md sm:w-auto">
            <DialogHeader>
              <DialogTitle>Clear All Notes</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete all notes? This will permanently remove all {states.notes.length} note{states.notes.length !== 1 ? 's' : ''} and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <div className="text-xs text-muted-foreground mb-2 sm:mb-0 sm:mr-auto">
                This action cannot be undone
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setClearAllDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmClearAllNotes}
                >
                  Clear All Notes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <HelpDialog 
          open={showHelpDialog} 
          onOpenChange={setShowHelpDialog} 
        />
      </div>
    </TooltipProvider>
  )
}

export default VerticalTabs