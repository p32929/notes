import React, { useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { controller, ILayoutNode, LayoutDirection } from '@/lib/StatesController'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Columns,
  LayoutTemplate,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import EditorInstance from './EditorInstance'

interface SplitViewProps {
  className?: string
}

// 拖拽状态
interface DragState {
  draggedId: string | null
  dragOverId: string | null
}

// 递归渲染布局节点
const LayoutNode: React.FC<{
  node: ILayoutNode
  depth?: number
  dragState: DragState
  setDragState: React.Dispatch<React.SetStateAction<DragState>>
}> = ({ node, depth = 0, dragState, setDragState }) => {
  const states = useSelector(() => controller.states)
  const isActive = states.activeEditorId === node.id

  if (node.type === 'leaf') {
    return (
      <EditorInstance
        nodeId={node.id}
        noteId={node.noteId}
        isActive={isActive}
        onClick={() => controller.setActiveEditor(node.id)}
        isDragOver={dragState.dragOverId === node.id}
        onDragStart={() => setDragState({ ...dragState, draggedId: node.id })}
        onDragEnd={() => setDragState({ draggedId: null, dragOverId: null })}
        onDragOver={(e) => {
          e.preventDefault()
          if (dragState.draggedId && dragState.draggedId !== node.id) {
            setDragState({ ...dragState, dragOverId: node.id })
          }
        }}
        onDragLeave={() => setDragState({ ...dragState, dragOverId: null })}
        onDrop={() => {
          if (dragState.draggedId && dragState.draggedId !== node.id) {
            controller.swapEditors(dragState.draggedId, node.id)
          }
          setDragState({ draggedId: null, dragOverId: null })
        }}
      />
    )
  }

  if (node.type === 'split' && node.children) {
    const isHorizontal = node.direction === 'horizontal'
    const totalSize = node.children.reduce((sum, child) =>
      sum + (isHorizontal ? (child.width || 50) : (child.height || 50)), 0
    )

    return (
      <div
        className={cn(
          'flex h-full overflow-hidden',
          isHorizontal ? 'flex-row' : 'flex-col'
        )}
      >
        {node.children.map((child, index) => {
          const size = isHorizontal
            ? (child.width || 50)
            : (child.height || 50)
          const percentage = (size / totalSize) * 100

          return (
            <React.Fragment key={child.id}>
              <div
                className="relative overflow-hidden"
                style={{
                  width: isHorizontal ? `${percentage}%` : '100%',
                  height: isHorizontal ? '100%' : `${percentage}%`,
                }}
              >
                <LayoutNode
                  node={child}
                  depth={depth + 1}
                  dragState={dragState}
                  setDragState={setDragState}
                />
              </div>
              {index < node.children!.length - 1 && (
                <Resizer
                  parentNode={node}
                  index={index}
                  direction={node.direction!}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  return null
}

// 拖拽调整大小的组件
const Resizer: React.FC<{
  parentNode: ILayoutNode
  index: number
  direction: LayoutDirection
}> = ({ parentNode, index, direction }) => {
  const [isDragging, setIsDragging] = useState(false)
  const isHorizontal = direction === 'horizontal'

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const startPos = isHorizontal ? e.clientX : e.clientY
    const children = parentNode.children!
    const firstChild = children[index]
    const secondChild = children[index + 1]
    const firstSize = isHorizontal
      ? (firstChild.width || 50)
      : (firstChild.height || 50)
    const secondSize = isHorizontal
      ? (secondChild.width || 50)
      : (secondChild.height || 50)
    const totalSize = firstSize + secondSize

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY
      const delta = currentPos - startPos
      const containerEl = (moveEvent.target as HTMLElement).parentElement
      if (!containerEl) return

      const containerSize = isHorizontal
        ? containerEl.offsetWidth
        : containerEl.offsetHeight
      const deltaPercent = (delta / containerSize) * totalSize

      const newFirstSize = Math.max(10, Math.min(90, firstSize + deltaPercent))
      const newSecondSize = totalSize - newFirstSize

      const updateChildren = (node: ILayoutNode): ILayoutNode => {
        if (node.id === parentNode.id && node.children) {
          const newChildren = [...node.children]
          newChildren[index] = {
            ...newChildren[index],
            [isHorizontal ? 'width' : 'height']: newFirstSize
          }
          newChildren[index + 1] = {
            ...newChildren[index + 1],
            [isHorizontal ? 'width' : 'height']: newSecondSize
          }
          return { ...node, children: newChildren }
        }
        if (node.type === 'split' && node.children) {
          return {
            ...node,
            children: node.children.map(updateChildren)
          }
        }
        return node
      }

      controller.updateLayout(updateChildren(controller.states.layout))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [parentNode, index, isHorizontal])

  return (
    <div
      className={cn(
        'flex-shrink-0 bg-border hover:bg-primary/50 transition-colors z-10',
        isHorizontal
          ? 'w-1 cursor-col-resize h-full'
          : 'h-1 cursor-row-resize w-full',
        isDragging && 'bg-primary'
      )}
      onMouseDown={handleMouseDown}
    />
  )
}

// Split View 切换按钮组件
export const SplitViewToggle: React.FC = () => {
  const states = useSelector(() => controller.states)
  const isSplitView = states.isSplitView

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isSplitView ? 'default' : 'ghost'}
            size="sm"
            onClick={() => controller.toggleSplitView()}
            className="h-8 w-8 p-0"
          >
            {isSplitView ? (
              <LayoutTemplate className="h-4 w-4" />
            ) : (
              <Columns className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>{isSplitView ? 'Exit Split View' : 'Enter Split View'}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// 主 Split View 组件
const SplitView: React.FC<SplitViewProps> = ({ className }) => {
  const states = useSelector(() => controller.states)
  const layout = states.layout
  const [dragState, setDragState] = useState<DragState>({
    draggedId: null,
    dragOverId: null
  })

  return (
    <div className={cn('h-full w-full overflow-hidden', className)}>
      <LayoutNode
        node={layout}
        dragState={dragState}
        setDragState={setDragState}
      />
    </div>
  )
}

export default SplitView
