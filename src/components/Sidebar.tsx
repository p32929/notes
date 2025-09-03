import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { controller } from '@/lib/StatesController'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  Folder, 
  FolderPlus, 
  Star, 
  Archive, 
  Plus,
  Edit,
  Trash,
  X
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const states = useSelector(() => controller.states)
  const [isAddingFolder, setIsAddingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      controller.createFolder(newFolderName.trim())
      setNewFolderName('')
      setIsAddingFolder(false)
    }
  }

  const handleEditFolder = (id: string, currentName: string) => {
    setEditingFolderId(id)
    setEditingName(currentName)
  }

  const handleSaveEdit = () => {
    if (editingFolderId && editingName.trim()) {
      controller.updateFolder(editingFolderId, { name: editingName.trim() })
    }
    setEditingFolderId(null)
    setEditingName('')
  }

  const handleDeleteFolder = (id: string) => {
    if (window.confirm('Are you sure you want to delete this folder? All notes will be moved to "All Notes".')) {
      controller.deleteFolder(id)
    }
  }

  const getFolderNoteCount = (folderId: string) => {
    if (folderId === 'default') {
      return states.notes.length
    }
    return states.notes.filter(note => note.folderId === folderId).length
  }

  const favoriteCount = states.notes.filter(note => note.isFavorite && !note.isArchived).length
  const archivedCount = states.notes.filter(note => note.isArchived).length

  return (
    <div className="w-64 h-full bg-muted/20 border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">9Notes</h2>
        <Button 
          className="w-full mt-3" 
          onClick={() => {
            const noteId = controller.createNote()
            controller.selectNote(noteId)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <Button
          variant={states.selectedFolderId === 'default' && !states.showFavorites && !states.showArchived ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            controller.setStates({ 
              selectedFolderId: 'default', 
              showFavorites: false, 
              showArchived: false 
            })
          }}
        >
          <Folder className="h-4 w-4 mr-3" />
          <span className="flex-1 text-left">All Notes</span>
          <span className="text-xs text-muted-foreground">{getFolderNoteCount('default')}</span>
        </Button>

        <Button
          variant={states.showFavorites ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            controller.setStates({ 
              showFavorites: !states.showFavorites,
              showArchived: false,
              selectedFolderId: 'default'
            })
          }}
        >
          <Star className="h-4 w-4 mr-3" />
          <span className="flex-1 text-left">Favorites</span>
          <span className="text-xs text-muted-foreground">{favoriteCount}</span>
        </Button>

        <Button
          variant={states.showArchived ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            controller.setStates({ 
              showArchived: !states.showArchived,
              showFavorites: false,
              selectedFolderId: 'default'
            })
          }}
        >
          <Archive className="h-4 w-4 mr-3" />
          <span className="flex-1 text-left">Archived</span>
          <span className="text-xs text-muted-foreground">{archivedCount}</span>
        </Button>
      </div>

      <Separator />

      {/* Folders Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">FOLDERS</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingFolder(true)}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add New Folder */}
          {isAddingFolder && (
            <div className="mb-2 flex items-center gap-2">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder()
                  if (e.key === 'Escape') {
                    setIsAddingFolder(false)
                    setNewFolderName('')
                  }
                }}
                className="text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleCreateFolder}>
                <Plus className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setIsAddingFolder(false)
                  setNewFolderName('')
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Folder List */}
          <div className="space-y-1">
            {states.folders
              .filter(folder => folder.id !== 'default')
              .map(folder => (
                <div key={folder.id} className="group">
                  {editingFolderId === folder.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit()
                          if (e.key === 'Escape') {
                            setEditingFolderId(null)
                            setEditingName('')
                          }
                        }}
                        className="text-sm"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setEditingFolderId(null)
                          setEditingName('')
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant={states.selectedFolderId === folder.id ? 'default' : 'ghost'}
                      className="w-full justify-start relative"
                      onClick={() => {
                        controller.setStates({ 
                          selectedFolderId: folder.id,
                          showFavorites: false,
                          showArchived: false
                        })
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded mr-3" 
                        style={{ backgroundColor: folder.color }}
                      />
                      <span className="flex-1 text-left truncate">{folder.name}</span>
                      <span className="text-xs text-muted-foreground mr-2">
                        {getFolderNoteCount(folder.id)}
                      </span>
                      
                      {/* Folder Actions */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditFolder(folder.id, folder.name)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteFolder(folder.id)
                          }}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar