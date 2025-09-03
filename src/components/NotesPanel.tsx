import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { controller } from '@/lib/StatesController'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Star, 
  Archive, 
  Trash, 
  Grid,
  List,
  SortAsc,
  SortDesc,
  Clock,
  Calendar,
  Type
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const NotesPanel: React.FC = () => {
  const states = useSelector(() => controller.states)
  const [searchQuery, setSearchQuery] = useState(states.searchQuery)

  const filteredNotes = controller.getFilteredNotes()

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    controller.setSearchQuery(query)
  }

  const handleNoteSelect = (noteId: string) => {
    controller.selectNote(noteId)
  }

  const handleToggleFavorite = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    controller.toggleFavorite(noteId)
  }

  const handleToggleArchive = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    controller.toggleArchive(noteId)
  }

  const handleDeleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this note?')) {
      controller.deleteNote(noteId)
    }
  }

  const getPreviewText = (content: string) => {
    // Strip HTML tags for preview
    const div = document.createElement('div')
    div.innerHTML = content
    const text = div.textContent || div.innerText || ''
    return text.slice(0, 150) + (text.length > 150 ? '...' : '')
  }

  const getSortIcon = () => {
    switch (states.sortBy) {
      case 'title':
        return <Type className="h-4 w-4" />
      case 'createdAt':
        return <Calendar className="h-4 w-4" />
      case 'updatedAt':
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="w-80 border-r border-border flex flex-col h-full bg-background">
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View and Sort Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Button
              variant={states.viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => controller.setStates({ viewMode: 'list' })}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={states.viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => controller.setStates({ viewMode: 'grid' })}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const sortOptions = ['updatedAt', 'createdAt', 'title'] as const
                const currentIndex = sortOptions.indexOf(states.sortBy)
                const nextSort = sortOptions[(currentIndex + 1) % sortOptions.length]
                controller.setStates({ sortBy: nextSort })
              }}
              title={`Sort by ${states.sortBy}`}
            >
              {getSortIcon()}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                controller.setStates({ 
                  sortOrder: states.sortOrder === 'asc' ? 'desc' : 'asc' 
                })
              }}
              title={`${states.sortOrder === 'asc' ? 'Ascending' : 'Descending'} order`}
            >
              {states.sortOrder === 'asc' ? 
                <SortAsc className="h-4 w-4" /> : 
                <SortDesc className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-xs text-muted-foreground mt-2">
          {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          {states.searchQuery && ` for "${states.searchQuery}"`}
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="mb-4">
              {states.searchQuery ? (
                <>
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notes found for "{states.searchQuery}"</p>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 mx-auto mb-2 bg-muted rounded-lg flex items-center justify-center">
                    📝
                  </div>
                  <p>No notes yet</p>
                </>
              )}
            </div>
            <Button 
              onClick={() => {
                const noteId = controller.createNote()
                controller.selectNote(noteId)
              }}
            >
              Create your first note
            </Button>
          </div>
        ) : (
          <div className={states.viewMode === 'grid' ? 'p-2 grid grid-cols-1 gap-2' : ''}>
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={`
                  group cursor-pointer transition-colors hover:bg-muted/50
                  ${states.selectedNoteId === note.id ? 'bg-muted border-l-4 border-l-primary' : ''}
                  ${states.viewMode === 'grid' ? 'rounded-lg border p-3' : 'border-b p-4'}
                `}
                onClick={() => handleNoteSelect(note.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${states.viewMode === 'grid' ? 'text-sm' : ''}`}>
                      {note.title || 'Untitled'}
                    </h3>
                    <p className={`text-muted-foreground mt-1 ${
                      states.viewMode === 'grid' ? 'text-xs line-clamp-2' : 'text-sm line-clamp-2'
                    }`}>
                      {getPreviewText(note.content) || 'No content'}
                    </p>
                    <div className={`flex items-center gap-2 mt-2 ${
                      states.viewMode === 'grid' ? 'text-xs' : 'text-xs'
                    } text-muted-foreground`}>
                      <span>
                        {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                      </span>
                      {note.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="truncate">
                            {note.tags.slice(0, 2).map(tag => `#${tag}`).join(' ')}
                            {note.tags.length > 2 && ` +${note.tags.length - 2}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleToggleFavorite(note.id, e)}
                      className={note.isFavorite ? 'text-yellow-500' : ''}
                    >
                      <Star className={`h-4 w-4 ${note.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleToggleArchive(note.id, e)}
                      className={note.isArchived ? 'text-blue-500' : ''}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesPanel