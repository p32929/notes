import React, { useEffect, useState, useCallback, useRef } from 'react'
import { List } from 'lucide-react'

interface HeadingItem {
  id: string
  text: string
  level: number
  pos: number
}

interface OutlineNavProps {
  editor: any
  className?: string
}

const OutlineNav: React.FC<OutlineNavProps> = ({ editor, className = '' }) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(true)
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  const extractHeadings = useCallback(() => {
    if (!editor) return

    const items: HeadingItem[] = []
    const doc = editor.state.doc

    doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'heading') {
        const id = `heading-${pos}`
        items.push({
          id,
          text: node.textContent || 'Untitled',
          level: node.attrs.level,
          pos
        })
      }
    })

    setHeadings(items)
  }, [editor])

  useEffect(() => {
    if (!editor) return

    extractHeadings()

    editor.on('update', extractHeadings)

    return () => {
      editor.off('update', extractHeadings)
    }
  }, [editor, extractHeadings])

  useEffect(() => {
    if (!editor) return

    const handleScroll = () => {
      const editorElement = editor.view.dom as HTMLElement
      if (!editorElement) return

      const scrollTop = editorElement.scrollTop
      const viewportHeight = editorElement.clientHeight

      let currentActiveId: string | null = null
      let closestPos = -1

      headings.forEach((heading) => {
        try {
          const coords = editor.view.coordsAtPos(heading.pos)
          const editorRect = editorElement.getBoundingClientRect()
          const relativeTop = coords.top - editorRect.top + scrollTop
          
          if (relativeTop <= scrollTop + viewportHeight / 3 && heading.pos > closestPos) {
            closestPos = heading.pos
            currentActiveId = heading.id
          }
        } catch (e) {
        }
      })

      setActiveId(currentActiveId)
    }

    const editorElement = editor.view.dom as HTMLElement
    if (editorElement) {
      editorElement.addEventListener('scroll', handleScroll)
      handleScroll()
      return () => editorElement.removeEventListener('scroll', handleScroll)
    }
  }, [editor, headings])

  const scrollToHeading = (heading: HeadingItem) => {
    if (!editor) return

    try {
      editor.chain().focus().setTextSelection(heading.pos).run()
      
      const editorElement = editor.view.dom as HTMLElement
      if (editorElement) {
        const coords = editor.view.coordsAtPos(heading.pos)
        const editorRect = editorElement.getBoundingClientRect()
        const scrollTarget = coords.top - editorRect.top + editorElement.scrollTop - 50
        
        editorElement.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        })
      }
    } catch (e) {
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <div className={`border-l border-border bg-background/50 ${className}`}>
      <div className="p-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outline</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <List className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
      {isOpen && (
        <div className="p-2 overflow-y-auto max-h-64" ref={scrollContainerRef}>
          <nav className="space-y-0.5">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading)}
                className={`w-full text-left py-1 px-2 rounded text-sm truncate transition-colors ${
                  activeId === heading.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
                style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
              >
                <span className="text-xs text-muted-foreground/50 mr-1.5">H{heading.level}</span>
                {heading.text}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}

export default OutlineNav
