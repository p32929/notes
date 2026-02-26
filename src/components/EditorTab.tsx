import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { controller, ISplitPane } from '@/lib/StatesController'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
import { 
  X, 
  GripVertical, 
  Plus,
  FileText,
  Columns,
  Rows,
  PanelLeftClose
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SortableTabProps {
  pane: ISplitPane
  isActive: boolean
  onSelect: () => void
  onClose: () => void
}

const SortableTab: React.FC<SortableTabProps> = ({ 
  pane, 
  isActive, 
  onSelect, 
  onClose 
}) => {
  const states = useSelector(() => controller.states)
  const note = states.notes.find(n => n.id === pane.noteId)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pane.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer',
        'border border-b-0 border-border',
        'transition-colors duration-150',
        isActive 
          ? 'bg-background text-foreground border-b-background' 
          : 'bg-muted/50 text-muted-foreground hover:bg-muted',
        isDragging && 'shadow-lg'
      )}
      onClick={handleClick}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted/50 rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <FileText className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm truncate max-w-[150px]">
        {note?.title || 'Untitled'}
      </span>
      {pane.noteId && (
        <button
          onClick={handleClose}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

interface EditorTabProps {
  panes: ISplitPane[]
  activePaneId: string | null
  onSelectPane: (paneId: string) => void
  onClosePane: (paneId: string) => void
  onSplitPane: (paneId: string, direction: 'horizontal' | 'vertical') => void
  onSwapPanes: (paneId1: string, paneId2: string) => void
  className?: string
}

export const EditorTab: React.FC<EditorTabProps> = ({
  panes,
  activePaneId,
  onSelectPane,
  onClosePane,
  onSplitPane,
  onSwapPanes,
  className
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      onSwapPanes(active.id as string, over?.id as string)
    }
  }

  const handleSplitHorizontal = (paneId: string) => {
    onSplitPane(paneId, 'horizontal')
  }

  const handleSplitVertical = (paneId: string) => {
    onSplitPane(paneId, 'vertical')
  }

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-0 border-b border-border bg-muted/30', className)}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={panes.map(p => p.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex items-end">
              {panes.map((pane) => (
                <SortableTab
                  key={pane.id}
                  pane={pane}
                  isActive={activePaneId === pane.id}
                  onSelect={() => onSelectPane(pane.id)}
                  onClose={() => onClosePane(pane.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex items-center gap-2 ml-auto px-3">
          {activePaneId && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSplitHorizontal(activePaneId)}
                    className="h-8 w-8 p-0"
                  >
                    <Columns className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Split horizontally</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSplitVertical(activePaneId)}
                    className="h-8 w-8 p-0"
                  >
                    <Rows className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Split vertically</TooltipContent>
              </Tooltip>
            </>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => controller.toggleSplitView()}
                className="h-8 w-8 p-0"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Exit Split View</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default EditorTab
