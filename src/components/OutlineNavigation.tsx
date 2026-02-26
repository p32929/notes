import React, { useEffect, useState, useCallback } from 'react'
import { IHeading } from '@/lib/StatesController'
import { cn } from '@/lib/utils'
import { List } from 'lucide-react'

interface OutlineNavigationProps {
  content: string
  editorRef?: React.RefObject<any>
  className?: string
}

export const OutlineNavigation: React.FC<OutlineNavigationProps> = ({ 
  content, 
  editorRef,
  className 
}) => {
  const [headings, setHeadings] = useState<IHeading[]>([])
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)

  const extractHeadings = useCallback((htmlContent: string): IHeading[] => {
    if (!htmlContent) return []
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const headingElements = doc.querySelectorAll('h1, h2, h3')
    
    const extractedHeadings: IHeading[] = []
    let offset = 0
    
    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1))
      const text = heading.textContent || ''
      const id = `heading-${index}`
      
      extractedHeadings.push({
        id,
        level,
        text,
        offset
      })
      
      offset += text.length
    })
    
    return extractedHeadings
  }, [])

  useEffect(() => {
    const newHeadings = extractHeadings(content)
    setHeadings(newHeadings)
  }, [content, extractHeadings])

  useEffect(() => {
    if (!editorRef?.current) return

    const editor = editorRef.current
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const editorElement = editor.view.dom
        const editorRect = editorElement.getBoundingClientRect()
        const scrollTop = editorElement.scrollTop
        const viewportHeight = editorRect.height
        
        let closestHeading: IHeading | null = null
        let closestDistance = Infinity

        headings.forEach(heading => {
          const headingElement = editorElement.querySelector(`[data-heading-id="${heading.id}"]`)
          if (headingElement) {
            const headingRect = headingElement.getBoundingClientRect()
            const relativeTop = headingRect.top - editorRect.top
            
            if (relativeTop >= -50 && relativeTop < viewportHeight / 2) {
              const distance = Math.abs(relativeTop)
              if (distance < closestDistance) {
                closestDistance = distance
                closestHeading = heading
              }
            }
          }
        })

        if (closestHeading) {
          setActiveHeadingId(closestHeading.id)
        }
      }, 100)
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('scroll', handleScroll)
    
    return () => {
      clearTimeout(scrollTimeout)
      editorElement.removeEventListener('scroll', handleScroll)
    }
  }, [headings, editorRef])

  const handleHeadingClick = (heading: IHeading) => {
    if (!editorRef?.current) return

    const editor = editorRef.current
    const editorElement = editor.view.dom
    const headingElement = editorElement.querySelector(`[data-heading-id="${heading.id}"]`)
    
    if (headingElement) {
      headingElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveHeadingId(heading.id)
    }
  }

  if (headings.length === 0) {
    return (
      <div className={cn('p-4 text-sm text-muted-foreground', className)}>
        <div className="flex items-center gap-2 mb-2">
          <List className="h-4 w-4" />
          <span className="font-medium">Outline</span>
        </div>
        <p className="text-xs">No headings found</p>
      </div>
    )
  }

  return (
    <div className={cn('p-2', className)}>
      <div className="flex items-center gap-2 mb-2 px-2">
        <List className="h-4 w-4" />
        <span className="font-medium text-sm">Outline</span>
      </div>
      <nav className="space-y-0.5">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => handleHeadingClick(heading)}
            className={cn(
              'w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors',
              'hover:bg-muted/50',
              activeHeadingId === heading.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground',
              heading.level === 2 && 'pl-4',
              heading.level === 3 && 'pl-6'
            )}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default OutlineNavigation
