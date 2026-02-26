import React, { useCallback } from 'react'
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { controller, ISplitPaneTab } from '@/lib/StatesController'

interface SortableTabProps {
  tab: ISplitPaneTab
  noteTitle: string
  isActive: boolean
  onSelect: () => void
  onClose: () => void
  paneId: string
}

const SortableTab: React.FC<SortableTabProps> = ({
  tab,
  noteTitle,
  isActive,
  onSelect,
  onClose,
  paneId
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center h-8 px-2 mr-1 rounded-t-md cursor-pointer
        border border-border border-b-0
        ${isActive
          ? 'bg-background text-foreground border-t-2 border-t-primary'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
        }
        ${isDragging ? 'shadow-lg z-50' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      <span
        {...attributes}
        {...listeners}
        className="text-xs truncate max-w-[120px] select-none"
      >
        {noteTitle || 'Untitled'}
      </span>
      <button
        className="ml-1 p-0.5 hover:bg-muted rounded transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

interface TabHeaderProps {
  paneId: string
  tabs: ISplitPaneTab[]
  activeTabId: string | undefined
  notes: { id: string; title: string }[]
}

const TabHeader: React.FC<TabHeaderProps> = ({
  paneId,
  tabs,
  activeTabId,
  notes
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((t) => t.id === active.id)
      const newIndex = tabs.findIndex((t) => t.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTabs = arrayMove(tabs, oldIndex, newIndex)
        const newActiveId = activeTabId || tabs[0]?.id
        controller.reorderTabsInPane(paneId, newTabs, newActiveId)
      }
    }
  }, [tabs, activeTabId, paneId])

  const getNoteTitle = (noteId: string): string => {
    return notes.find((n) => n.id === noteId)?.title || 'Untitled'
  }

  const handleNewTab = () => {
    const availableNotes = notes.filter(
      (n) => !tabs.some((t) => t.noteId === n.id)
    )
    if (availableNotes.length > 0) {
      const event = new CustomEvent('triggerPaneNoteSelect', {
        detail: { paneId }
      })
      window.dispatchEvent(event)
    } else {
      const noteId = controller.createNote()
      controller.openNoteInPane(paneId, noteId)
    }
  }

  return (
    <div className="flex items-center h-9 bg-muted/30 border-b border-border overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tabs.map((t) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex items-end h-full px-1">
            {tabs.map((tab) => (
              <SortableTab
                key={tab.id}
                tab={tab}
                noteTitle={getNoteTitle(tab.noteId)}
                isActive={activeTabId === tab.id}
                onSelect={() => controller.selectTabInPane(paneId, tab.id)}
                onClose={() => controller.closeTabInPane(paneId, tab.id)}
                paneId={paneId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 ml-1"
        onClick={handleNewTab}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default TabHeader
