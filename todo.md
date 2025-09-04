# 9Notes - Feature Implementation Todo

## 🎯 Priority Features to Implement

### 1. Drag & Drop Reordering ⏳
- [ ] Install react-beautiful-dnd or @dnd-kit/core
- [ ] Implement drag & drop for note reordering in sidebar
- [ ] Add visual feedback during drag operations
- [ ] Update note order in state management
- [ ] Persist note order in local storage

### 2. Keyboard Shortcuts ⌨️
- [ ] Set up global keyboard event listeners
- [ ] Implement Cmd+N (new note)
- [ ] Implement Cmd+D (delete current note)
- [ ] Add Cmd+S (manual save)
- [ ] Add Cmd+F (search/focus search)
- [ ] Add Escape (close dialogs/modals)
- [ ] Add arrow keys for note navigation
- [ ] Show keyboard shortcuts in tooltips/help

### 3. Search Functionality 🔍
- [ ] Add search input field to sidebar header
- [ ] Implement real-time search filtering
- [ ] Search through note titles and content
- [ ] Highlight search matches
- [ ] Add search shortcuts and clear functionality
- [ ] Handle empty search states

### 4. Bulk Operations 📦
- [ ] Add checkbox selection mode
- [ ] Multi-select notes with checkboxes
- [ ] Bulk delete selected notes
- [ ] Bulk export selected notes
- [ ] Select all/none functionality
- [ ] Show bulk action toolbar when notes selected

### 5. Auto-save Indicator 💾
- [ ] Add save status indicator to editor
- [ ] Show "Saving..." while changes are being saved
- [ ] Show "Saved" confirmation
- [ ] Handle save errors gracefully
- [ ] Add timestamp of last save

### 6. Note Folders/Categories 📁
- [ ] Design folder structure in state management
- [ ] Add folder creation/editing UI
- [ ] Implement drag & drop notes into folders
- [ ] Add folder navigation in sidebar
- [ ] Folder-based filtering and organization

### 7. Favorites/Pin Notes ⭐
- [ ] Add favorite/pin toggle to notes
- [ ] Update state management for favorites
- [ ] Show pinned notes at top of list
- [ ] Add visual indicator for pinned notes
- [ ] Persist favorite status

### 8. Note Sharing (Export Individual Notes) 📤
- [ ] Add share/export button to individual notes
- [ ] Implement markdown export functionality
- [ ] Implement PDF export functionality
- [ ] Add copy-to-clipboard for quick sharing
- [ ] Handle export errors and loading states

### 9. Note Linking with [[note-title]] Syntax 🔗
- [ ] Parse [[note-title]] syntax in editor
- [ ] Auto-complete note titles while typing
- [ ] Make note links clickable
- [ ] Navigate to linked notes on click
- [ ] Handle non-existent note links
- [ ] Visual styling for note links

---

## 🚀 Implementation Status
- ⏳ In Progress
- ✅ Completed
- ❌ Blocked
- 📝 Needs Review

## 🎨 Design Considerations
- Maintain consistency with existing UI patterns
- Ensure mobile responsiveness for all features
- Follow accessibility best practices
- Keep performance impact minimal

## 📱 Mobile-Specific Considerations
- Touch-friendly drag & drop
- Mobile keyboard shortcuts (long press, swipe gestures)
- Responsive search interface
- Mobile-optimized bulk selection

---

*Last updated: ${new Date().toLocaleDateString()}*