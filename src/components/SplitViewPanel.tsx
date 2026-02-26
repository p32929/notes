import React, { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { controller, ISplitPane } from '@/lib/StatesController'
import { cn } from '@/lib/utils'
import EditorTab from './EditorTab'
import SingleEditorPane from './SingleEditorPane'

interface SplitViewPanelProps {
  className?: string
}

export const SplitViewPanel: React.FC<SplitViewPanelProps> = ({ className }) => {
  const states = useSelector(() => controller.states)
  const { splitLayout, activePaneId, notes } = states

  const getAllLeafPanes = useCallback((pane: ISplitPane): ISplitPane[] => {
    if (pane.children && pane.children.length > 0) {
      return pane.children.flatMap(getAllLeafPanes)
    }
    return [pane]
  }, [])

  const leafPanes = useMemo(() => {
    if (!splitLayout) return []
    return getAllLeafPanes(splitLayout)
  }, [splitLayout, getAllLeafPanes])

  const handleSelectPane = useCallback((paneId: string) => {
    controller.setActivePane(paneId)
  }, [])

  const handleClosePane = useCallback((paneId: string) => {
    controller.closePane(paneId)
  }, [])

  const handleSplitPane = useCallback((paneId: string, direction: 'horizontal' | 'vertical') => {
    controller.splitPane(paneId, direction)
  }, [])

  const handleSwapPanes = useCallback((paneId1: string, paneId2: string) => {
    controller.swapPanes(paneId1, paneId2)
  }, [])

  const handleNoteSelect = useCallback((paneId: string, noteId: string) => {
    controller.updatePaneNoteId(paneId, noteId)
  }, [])

  const renderPane = useCallback((pane: ISplitPane, depth: number = 0): React.ReactNode => {
    if (pane.children && pane.children.length > 0) {
      const direction = pane.direction || 'horizontal'
      return (
        <div
          key={pane.id}
          className={cn(
            'flex',
            direction === 'horizontal' ? 'flex-row' : 'flex-col',
            'flex-1 min-w-0 min-h-0'
          )}
        >
          {pane.children.map((child, index) => (
            <React.Fragment key={child.id}>
              {index > 0 && (
                <div
                  className={cn(
                    'bg-border flex-shrink-0',
                    direction === 'horizontal' 
                      ? 'w-1 cursor-col-resize hover:w-2 hover:bg-primary/50 transition-all' 
                      : 'h-1 cursor-row-resize hover:h-2 hover:bg-primary/50 transition-all'
                  )}
                />
              )}
              <div 
                className="flex-1 min-w-0 min-h-0"
                style={{ 
                  flex: child.size ? `0 0 ${child.size}%` : '1 1 0'
                }}
              >
                {renderPane(child, depth + 1)}
              </div>
            </React.Fragment>
          ))}
        </div>
      )
    }

    return (
      <div 
        key={pane.id} 
        className="flex flex-col h-full min-w-0"
        onClick={() => handleSelectPane(pane.id)}
      >
        <SingleEditorPane
          pane={pane}
          isActive={activePaneId === pane.id}
          onNoteSelect={(noteId) => handleNoteSelect(pane.id, noteId)}
        />
      </div>
    )
  }, [activePaneId, handleSelectPane, handleNoteSelect])

  if (!splitLayout) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <p className="text-muted-foreground">No split layout configured</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <EditorTab
        panes={leafPanes}
        activePaneId={activePaneId}
        onSelectPane={handleSelectPane}
        onClosePane={handleClosePane}
        onSplitPane={handleSplitPane}
        onSwapPanes={handleSwapPanes}
      />
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderPane(splitLayout)}
      </div>
    </div>
  )
}

export default SplitViewPanel
