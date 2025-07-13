import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { controller } from '@/lib/StatesController'
import { Search, FileText, X, ArrowUp, ArrowDown } from 'lucide-react'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange }) => {
  const states = useSelector(() => controller.states)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const stripHtmlTags = (html: string) => {
    // Create a temporary element to parse HTML and extract text content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ''
  }

  // Filter notes based on search query
  const filteredNotes = React.useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase()
    return states.notes.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(query)
      const plainContent = stripHtmlTags(note.content)
      const contentMatch = plainContent.toLowerCase().includes(query)
      return titleMatch || contentMatch
    }).map(note => {
      // Calculate relevance score for fuzzy search
      const titleMatch = note.title.toLowerCase().includes(query)
      const plainContent = stripHtmlTags(note.content)
      const contentMatch = plainContent.toLowerCase().includes(query)
      const titleScore = titleMatch ? 10 : 0
      const contentScore = contentMatch ? 5 : 0
      
      return {
        ...note,
        relevanceScore: titleScore + contentScore,
        titleMatch,
        contentMatch
      }
    }).sort((a, b) => b.relevanceScore - a.relevanceScore)
  }, [searchQuery, states.notes])

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery('')
      setSelectedIndex(0)
      // Focus search input after a short delay to ensure dialog is fully rendered
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredNotes.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && filteredNotes.length > 0) {
        e.preventDefault()
        handleSelectNote(filteredNotes[selectedIndex])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, filteredNotes, selectedIndex])

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredNotes.length])

  const handleSelectNote = (note: any) => {
    controller.selectNote(note.id)
    onOpenChange(false)
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark>
        : part
    )
  }

  const getPreviewText = (content: string, query: string) => {
    // Strip HTML tags from content first
    const plainContent = stripHtmlTags(content)
    
    if (!query.trim()) return plainContent.slice(0, 100) + '...'
    
    const lowerContent = plainContent.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const index = lowerContent.indexOf(lowerQuery)
    
    if (index === -1) return plainContent.slice(0, 100) + '...'
    
    const start = Math.max(0, index - 50)
    const end = Math.min(plainContent.length, index + query.length + 50)
    const preview = plainContent.slice(start, end)
    
    return (start > 0 ? '...' : '') + preview + (end < plainContent.length ? '...' : '')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl h-[80vh] max-h-[600px] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Notes
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col flex-1 min-h-0">
          {/* Search Input */}
          <div className="flex-shrink-0 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in note titles and content..."
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-muted-foreground">
                Found {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
                {filteredNotes.length > 0 && (
                  <span className="ml-2">
                    • Use ↑↓ to navigate • Enter to select
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {!searchQuery.trim() ? (
              <div className="text-center text-muted-foreground mt-8">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start typing to search through your notes...</p>
                <p className="text-sm mt-2">Search in both titles and content</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center text-muted-foreground mt-8">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notes found for "{searchQuery}"</p>
                <p className="text-sm mt-2">Try different keywords</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotes.map((note, index) => (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      index === selectedIndex
                        ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20'
                        : 'hover:bg-muted/50 border-border/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1 truncate">
                          {highlightMatch(note.title || 'Untitled', searchQuery)}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          Updated {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                        {note.contentMatch && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {highlightMatch(getPreviewText(note.content, searchQuery), searchQuery)}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {note.titleMatch && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                              Title match
                            </span>
                          )}
                          {note.contentMatch && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
                              Content match
                            </span>
                          )}
                        </div>
                      </div>
                      {index === selectedIndex && (
                        <div className="flex flex-col gap-1 text-muted-foreground">
                          <ArrowUp className="w-3 h-3" />
                          <ArrowDown className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}