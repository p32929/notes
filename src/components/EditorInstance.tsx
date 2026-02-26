import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { controller, INote } from '@/lib/StatesController'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import RichTextEditor from './RichTextEditor'
import {
  X,
  Plus,
  GripVertical,
  FileText,
  ChevronDown,
  Edit3,
  Trash,
  Columns,
  LayoutTemplate
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'

interface EditorInstanceProps {
  nodeId: string
  noteId: string | null | undefined
  isActive: boolean
  onClick?: () => void
  // 拖拽相关
  isDragOver?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: () => void
  onDrop?: () => void
}

// Tab Header 组件
interface TabHeaderProps {
  nodeId: string
  noteId: string | null | undefined
  isActive: boolean
  onClick: () => void
}

const TabHeader: React.FC<TabHeaderProps> = ({
  nodeId,
  noteId,
  isActive,
  onClick
}) => {
  const states = useSelector(() => controller.states)
  const [showNoteSelector, setShowNoteSelector] = useState(false)
  const selectorRef = useRef<HTMLDivElement>(null)

  const note = noteId 
    ? states.notes.find(n => n.id === noteId) 
    : null

  // 点击外部关闭选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowNoteSelector(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNoteSelect = (selectedNoteId: string) => {
    controller.openNoteInEditor(nodeId, selectedNoteId)
    setShowNoteSelector(false)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    controller.closeEditor(nodeId)
  }

  const handleSplitHorizontal = (e: React.MouseEvent) => {
    e.stopPropagation()
    controller.splitEditor(nodeId, 'horizontal')
  }

  const handleSplitVertical = (e: React.MouseEvent) => {
    e.stopPropagation()
    controller.splitEditor(nodeId, 'vertical')
  }

  return (
    <div
      ref={selectorRef}
      className={cn(
        'flex items-center gap-1 px-2 py-1.5 border-b cursor-pointer select-none',
        isActive 
          ? 'bg-background border-primary/30' 
          : 'bg-muted/50 border-border hover:bg-muted'
      )}
      onClick={onClick}
    >
      {/* 拖拽手柄 */}
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab active:cursor-grabbing" />

      {/* 笔记图标和标题 */}
      <div className="flex-1 flex items-center gap-1.5 min-w-0">
        <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-sm truncate">
          {note ? note.title || 'Untitled' : 'Select Note'}
        </span>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* 笔记选择下拉 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowNoteSelector(!showNoteSelector)
                }}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Select Note</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 水平分割 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={handleSplitHorizontal}
              >
                <Columns className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Split Horizontal</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 垂直分割 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={handleSplitVertical}
              >
                <LayoutTemplate className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Split Vertical</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 关闭编辑器 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:text-red-500"
                onClick={handleClose}
              >
                <X className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Close Editor</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* 笔记选择下拉菜单 */}
      {showNoteSelector && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
          <div className="p-1">
            <div className="text-xs text-muted-foreground px-2 py-1">
              Select a note
            </div>
            {states.notes.length === 0 ? (
              <div className="text-sm text-muted-foreground px-2 py-2 text-center">
                No notes available
              </div>
            ) : (
              states.notes.map(n => (
                <button
                  key={n.id}
                  className={cn(
                    'w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent',
                    n.id === noteId && 'bg-accent'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNoteSelect(n.id)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{n.title || 'Untitled'}</span>
                  </div>
                </button>
              ))
            )}
            <div className="border-t mt-1 pt-1">
              <button
                className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  const newNoteId = controller.createNote()
                  handleNoteSelect(newNoteId)
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create New Note</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 编辑器实例组件
const EditorInstance: React.FC<EditorInstanceProps> = ({
  nodeId,
  noteId,
  isActive,
  onClick,
  isDragOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const states = useSelector(() => controller.states)
  const [editor, setEditor] = useState<any>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [deleteDialog, setDeleteDialog] = useState(false)

  const note = noteId 
    ? states.notes.find(n => n.id === noteId) 
    : null

  // 自动聚焦编辑器
  useEffect(() => {
    if (note && editor && isActive) {
      setTimeout(() => {
        try {
          if (editor.commands && editor.commands.focus) {
            editor.commands.focus()
          }
        } catch (error) {
          console.log('Could not focus editor:', error)
        }
      }, 100)
    }
  }, [note?.id, editor, isActive])

  const handleTitleEdit = () => {
    if (note) {
      setTitleValue(note.title)
      setIsEditingTitle(true)
    }
  }

  const handleTitleSave = () => {
    if (note && titleValue.trim()) {
      controller.updateNote(note.id, { title: titleValue.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleContentChange = (content: string) => {
    if (note) {
      controller.updateNote(note.id, { content })
    }
  }

  const handleDelete = () => {
    if (note) {
      setDeleteDialog(true)
    }
  }

  const confirmDelete = () => {
    if (note) {
      controller.deleteNote(note.id)
      setDeleteDialog(false)
    }
  }

  const getTextContent = (htmlContent: string): string => {
    if (!htmlContent) return ''
    const div = document.createElement('div')
    div.innerHTML = htmlContent
    return div.textContent || div.innerText || ''
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          'h-full flex flex-col bg-background group transition-all',
          isActive && 'ring-1 ring-primary/20',
          isDragOver && 'ring-2 ring-primary bg-primary/5'
        )}
        onClick={onClick}
        data-editor-instance
        data-note-id={noteId || ''}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move'
          onDragStart?.()
        }}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={(e) => {
          e.preventDefault()
          onDrop?.()
        }}
      >
        {/* Tab Header */}
        <TabHeader
          nodeId={nodeId}
          noteId={noteId}
          isActive={isActive}
          onClick={onClick || (() => {})}
        />

        {/* 编辑器内容区域 */}
        {note ? (
          <>
            {/* 标题栏 */}
            <div className="border-b border-border px-3 py-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {isEditingTitle ? (
                    <Input
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTitleSave()
                        if (e.key === 'Escape') {
                          setIsEditingTitle(false)
                          setTitleValue('')
                        }
                      }}
                      className="text-sm font-semibold border-0 px-0 focus-visible:ring-0 h-7"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className="flex items-center group/title cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTitleEdit()
                      }}
                    >
                      <h2 className="text-sm font-semibold hover:text-muted-foreground transition-colors truncate">
                        {note.title || 'Untitled Note'}
                      </h2>
                      <Edit3 className="h-3 w-3 ml-1.5 opacity-0 group-hover/title:opacity-100 transition-opacity text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>Updated {formatDistanceToNow(note.updatedAt, { addSuffix: true })}</span>
                  </div>
                </div>

                {/* 删除按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* 富文本编辑器 */}
            <div className="flex-1 overflow-hidden">
              <RichTextEditor
                content={note.content}
                onChange={handleContentChange}
                placeholder="Start writing your note..."
                className="h-full"
                onEditorReady={setEditor}
              />
            </div>

            {/* 状态栏 */}
            <div className="border-t border-border px-3 py-1.5 bg-muted/20 flex-shrink-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>Auto-saved</span>
                  <span>Words: {getTextContent(note.content).split(/\s+/).filter(word => word.length > 0).length}</span>
                </div>
                <div>
                  <span>{getTextContent(note.content).length} chars</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* 空状态 */
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Select a note or create a new one
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={(e) => {
                e.stopPropagation()
                const newNoteId = controller.createNote()
                controller.openNoteInEditor(nodeId, newNoteId)
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create Note
            </Button>
          </div>
        )}

        {/* 删除确认对话框 */}
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent className="w-[95vw] max-w-md sm:w-auto">
            <DialogHeader>
              <DialogTitle>Delete Note</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{note?.title || 'Untitled'}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default EditorInstance
