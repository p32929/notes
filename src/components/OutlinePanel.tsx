import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { controller } from '@/lib/StatesController'
import { cn } from '@/lib/utils'
import {
  List,
  ChevronRight,
  Hash,
  Type
} from 'lucide-react'

interface OutlineItem {
  id: string
  level: number
  text: string
  element?: HTMLElement
}

interface OutlinePanelProps {
  noteId: string | null | undefined
  className?: string
}

// 解析 HTML 内容提取标题
const parseOutline = (htmlContent: string): OutlineItem[] => {
  if (!htmlContent) return []

  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')

  return Array.from(headings).map((heading, index) => ({
    id: `heading-${index}`,
    level: parseInt(heading.tagName[1]),
    text: heading.textContent || ''
  }))
}

// 从实际 DOM 中提取标题（更准确）
const extractOutlineFromDOM = (container: HTMLElement | null): OutlineItem[] => {
  if (!container) return []

  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
  return Array.from(headings).map((heading, index) => ({
    id: `dom-heading-${index}`,
    level: parseInt(heading.tagName[1]),
    text: heading.textContent || '',
    element: heading as HTMLElement
  }))
}

const OutlinePanel: React.FC<OutlinePanelProps> = ({ noteId, className }) => {
  const states = useSelector(() => controller.states)
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  const note = noteId
    ? states.notes.find(n => n.id === noteId)
    : null

  // 提取大纲
  useEffect(() => {
    if (note?.content) {
      const items = parseOutline(note.content)
      setOutline(items)
    } else {
      setOutline([])
    }
  }, [note?.content])

  // 监听滚动，高亮当前可视区域的标题
  useEffect(() => {
    if (!noteId || outline.length === 0) return

    // 找到当前编辑器实例的 DOM 容器
    const findEditorContainer = () => {
      const editors = document.querySelectorAll('[data-editor-instance]')
      for (const editor of editors) {
        const editorNoteId = editor.getAttribute('data-note-id')
        if (editorNoteId === noteId) {
          return editor.querySelector('.ProseMirror') as HTMLElement
        }
      }
      return null
    }

    const handleScroll = () => {
      const container = findEditorContainer()
      if (!container) return

      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      if (headings.length === 0) return

      // 找到当前在视口内的标题
      const scrollTop = container.scrollTop
      const containerRect = container.getBoundingClientRect()

      let currentHeading: Element | null = null
      let minDistance = Infinity

      for (const heading of headings) {
        const rect = heading.getBoundingClientRect()
        const relativeTop = rect.top - containerRect.top

        // 找到最接近顶部且在视口内的标题
        if (relativeTop >= -20 && relativeTop < minDistance) {
          minDistance = relativeTop
          currentHeading = heading
        }
      }

      if (currentHeading) {
        const index = Array.from(headings).indexOf(currentHeading)
        setActiveHeadingId(`dom-heading-${index}`)
      }
    }

    const container = findEditorContainer()
    if (container) {
      container.addEventListener('scroll', handleScroll)
      handleScroll() // 初始检查

      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [noteId, outline.length])

  // 点击大纲项滚动到对应位置
  const handleItemClick = useCallback((item: OutlineItem) => {
    if (!noteId) return

    // 找到编辑器容器
    const editors = document.querySelectorAll('[data-editor-instance]')
    for (const editor of editors) {
      const editorNoteId = editor.getAttribute('data-note-id')
      if (editorNoteId === noteId) {
        const proseMirror = editor.querySelector('.ProseMirror')
        if (proseMirror) {
          const headings = proseMirror.querySelectorAll('h1, h2, h3, h4, h5, h6')
          const index = parseInt(item.id.split('-').pop() || '0')
          const targetHeading = headings[index]

          if (targetHeading) {
            targetHeading.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setActiveHeadingId(item.id)
          }
        }
        break
      }
    }
  }, [noteId])

  if (!note) {
    return (
      <div className={cn('h-full flex flex-col bg-muted/30 border-r', className)}>
        <div className="p-3 border-b border-border">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <List className="h-4 w-4" />
            Outline
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-muted-foreground text-center">
            Select a note to view outline
          </p>
        </div>
      </div>
    )
  }

  if (outline.length === 0) {
    return (
      <div className={cn('h-full flex flex-col bg-muted/30 border-r', className)}>
        <div className="p-3 border-b border-border">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <List className="h-4 w-4" />
            Outline
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-muted-foreground text-center">
            No headings found
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('h-full flex flex-col bg-muted/30 border-r', className)}>
      {/* 标题栏 */}
      <div
        className="p-3 border-b border-border flex items-center justify-between cursor-pointer hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-sm font-medium flex items-center gap-2">
          <List className="h-4 w-4" />
          Outline
          <span className="text-xs text-muted-foreground">({outline.length})</span>
        </h3>
        <ChevronRight
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isExpanded && 'rotate-90'
          )}
        />
      </div>

      {/* 大纲列表 */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto py-2">
          {outline.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                'w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors flex items-center gap-2',
                activeHeadingId === item.id && 'bg-primary/10 text-primary font-medium'
              )}
              style={{ paddingLeft: `${12 + (item.level - 1) * 16}px` }}
            >
              {item.level === 1 ? (
                <Type className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              ) : (
                <Hash className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              )}
              <span className="truncate">{item.text || `Heading ${item.level}`}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default OutlinePanel
