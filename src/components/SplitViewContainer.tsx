import React, { useCallback, useRef, useState } from 'react'
import { controller, ISplitPane } from '@/lib/StatesController'
import PaneEditor from './PaneEditor'

interface SplitViewContainerProps {
  layout: ISplitPane
  depth?: number
}

const SplitViewContainer: React.FC<SplitViewContainerProps> = ({
  layout,
  depth = 0
}) => {
  if (layout.type === 'pane') {
    return <PaneEditor pane={layout} />
  }

  if (layout.type === 'split' && layout.children && layout.children.length > 0) {
    const isHorizontal = layout.direction === 'horizontal'

    if (layout.children.length === 1) {
      return (
        <SplitViewContainer layout={layout.children[0]} depth={depth + 1} />
      )
    }

    return (
      <div
        className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} h-full w-full overflow-hidden`}
      >
        {layout.children.map((child, index) => (
          <React.Fragment key={child.id}>
            <div
              className="overflow-hidden"
              style={{
                flexBasis: child.size ? `${child.size}%` : '50%',
                flexGrow: 0,
                flexShrink: 0,
                minWidth: isHorizontal ? '200px' : '100%',
                minHeight: isHorizontal ? '100%' : '150px',
                width: isHorizontal ? 'auto' : '100%',
                height: isHorizontal ? '100%' : 'auto'
              }}
            >
              <SplitViewContainer layout={child} depth={depth + 1} />
            </div>
            {index < layout.children!.length - 1 && (
              <ResizeHandle
                isHorizontal={isHorizontal}
                onResize={(delta) => {
                  const currentSizes = layout.children!.map(c => c.size || 50)
                  const newSize0 = Math.max(20, Math.min(80, currentSizes[0] + delta))
                  const newSize1 = 100 - newSize0
                  controller.updatePaneSizes(layout.id, [newSize0, newSize1])
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return null
}

interface ResizeHandleProps {
  isHorizontal: boolean
  onResize: (delta: number) => void
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  isHorizontal,
  onResize
}) => {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const startPos = isHorizontal ? e.clientX : e.clientY
      let lastPos = startPos

      const handleMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault()
        moveEvent.stopPropagation()
        
        const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY
        if (currentPos !== lastPos) {
          const container = e.currentTarget.parentElement
          if (container) {
            const containerSize = isHorizontal ? container.clientWidth : container.clientHeight
            const delta = ((currentPos - lastPos) / containerSize) * 100
            lastPos = currentPos
            onResize(delta)
          }
        }
      }

      const handleMouseUp = (upEvent: MouseEvent) => {
        upEvent.preventDefault()
        upEvent.stopPropagation()
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [isHorizontal, onResize]
  )

  return (
    <div
      className={`
        flex items-center justify-center
        bg-muted hover:bg-primary/30 transition-colors
        ${isHorizontal
          ? 'w-1 cursor-col-resize hover:w-2'
          : 'h-1 cursor-row-resize hover:h-2'
        }
      `}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`
          rounded-full bg-muted-foreground/40
          ${isHorizontal ? 'w-0.5 h-6' : 'h-0.5 w-6'}
        `}
      />
    </div>
  )
}

export default SplitViewContainer
