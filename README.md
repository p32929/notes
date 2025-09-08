# 9Notes - Advanced Note-Taking App

A modern, feature-rich note-taking application built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

### ✨ **Core Functionality**
- **Rich Text Editor** with TipTap/ProseMirror
- **Smart Auto-Save** with optimized IndexedDB storage
- **Real-time Fuzzy Search** through note titles and content
- **Drag & Drop** note reordering for organization
- **Import/Export** notes as JSON files
- **Cross-Platform** keyboard shortcuts (Mac/Windows/Linux)

### 🎨 **Customization**
- **Multiple Themes**: Light, Dark, System auto-switching
- **8 Color Schemes**: Blue, Green, Red, Purple, Orange, Teal, Indigo, Pink
- **Responsive Design** optimized for mobile and desktop
- **Modern UI** with smooth animations and transitions

### 💾 **Advanced Storage**
- **IndexedDB Database** for offline support and performance
- **Automatic Migration** from localStorage
- **Smart Change Detection** - only saves what changed
- **Bulk Operations** support for import/export
- **Data Persistence** across browser sessions

### ⌨️ **Power User Features**
- **50+ Keyboard Shortcuts** for everything
- **Text Formatting Shortcuts** (Bold, Italic, Headers, Lists)
- **Navigation Shortcuts** between notes
- **Quick Actions** (Create, Delete, Search)
- **Tooltip Hints** showing shortcuts on hover

## 🚀 Live Demo

Visit the app at: https://p32929.github.io/notes/

## 📸 Screenshots

### 📝 **Rich Text Editor**
Full-featured note-taking experience with a professional editor, formatting toolbar, drag & drop sidebar, and clean interface. Shows auto-save status, word count, and character limit at the bottom.

<img width="3024" height="1714" alt="9Notes - Rich Text Editor with formatting toolbar, sidebar navigation, and auto-save status" src="https://github.com/user-attachments/assets/4486b6ce-ec66-4ac1-85c5-fccd50d1eb07" />

### ⚙️ **Theme & Settings**
Comprehensive settings panel with theme switching (Light/Dark/System), 8 beautiful color schemes, and data management tools. Import/export your notes, clear all data, or switch themes to match your preference.

<img width="3024" height="1714" alt="9Notes - Settings panel showing theme options, color schemes, and import/export functionality" src="https://github.com/user-attachments/assets/dddb9c36-a73c-486f-9ebe-e44b3050299b" />

### 🔍 **Intelligent Search**
Lightning-fast fuzzy search that finds notes by title or content. Smart matching helps you find what you're looking for even with partial or misspelled words. Navigate results with keyboard arrows and open notes instantly.

<img width="3024" height="1714" alt="9Notes - Search dialog with fuzzy matching, showing search results and keyboard navigation" src="https://github.com/user-attachments/assets/74dc49b8-48e4-4f89-8e02-43374e13f8fa" />

## 📖 Quick Start Guide

### **Getting Started**
1. **Create your first note**: Click the `+` button or press `Cmd/Ctrl + K`
2. **Start writing**: The editor auto-focuses, just start typing
3. **Format text**: Use the toolbar or keyboard shortcuts for formatting
4. **Auto-save**: Your notes save automatically as you type (1-second delay)

### **Power User Tips**
- **Search everything**: Press `Cmd/Ctrl + F` and use fuzzy search to find any note
- **Quick navigation**: Use `Option/Alt + ↑/↓` to move between notes without clicking  
- **Organize**: Drag and drop notes in the sidebar to reorder them
- **Themes**: Click the settings icon to change themes and colors
- **Import/Export**: Backup your notes or migrate from other apps via JSON

### **Efficient Workflow**
1. `Cmd/Ctrl + K` → Create note
2. Type your content with rich formatting shortcuts
3. `Cmd/Ctrl + F` → Search when you need to find something  
4. `Option/Alt + ↑/↓` → Navigate between notes
5. `Cmd/Ctrl + D` → Delete when needed

## 🛠 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Getting Started

```bash
# Clone the repository
git clone https://github.com/p32929/notes.git
cd notes

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:4000`

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚢 Deployment to GitHub Pages

To deploy to GitHub Pages:

```bash
# Build and deploy to gh-pages branch
npm run deploy
```

This will:
1. Build the app for production with correct base path
2. Push the built files to the `gh-pages` branch
3. GitHub Pages will automatically serve from that branch

### Manual Deployment Steps

1. Make sure your GitHub repo has Pages enabled
2. Set Pages source to "Deploy from branch: gh-pages"
3. Run `npm run deploy`
4. Your app will be live at `https://yourusername.github.io/notes/`

## ⌨️ Keyboard Shortcuts

### 🚀 **Global Actions**
- `Cmd/Ctrl + K` - Create new note
- `Cmd/Ctrl + F` - Open search dialog  
- `Cmd/Ctrl + S` - Manual save (auto-save runs automatically)
- `Cmd/Ctrl + D` - Delete current note
- `Option/Alt + ↑/↓` - Navigate between notes
- `Escape` - Close any open dialog

### ✍️ **Text Formatting**
- `Cmd/Ctrl + B` - **Bold** text
- `Cmd/Ctrl + Shift + I` - *Italic* text  
- `Cmd/Ctrl + U` - <u>Underline</u> text
- `Cmd/Ctrl + Shift + S` - ~~Strikethrough~~ text
- `Cmd/Ctrl + E` - `Inline code`

### 📝 **Document Structure**
- `Cmd/Ctrl + 1` - # Heading 1
- `Cmd/Ctrl + 2` - ## Heading 2  
- `Cmd/Ctrl + 3` - ### Heading 3
- `Cmd/Ctrl + Shift + L` - • Bullet list
- `Cmd/Ctrl + Shift + O` - 1. Numbered list
- `Cmd/Ctrl + Shift + Q` - > Quote block
- `Cmd/Ctrl + Shift + C` - ```Code block```

### 🔧 **Editor Actions**
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Y` - Redo (Windows) / `Cmd + Shift + Z` (Mac)
- `Cmd/Ctrl + A` - Select all
- `Tab` - Increase list indentation
- `Shift + Tab` - Decrease list indentation

### 💡 **Pro Tips**
- All shortcuts work cross-platform (automatically detects Mac/Windows/Linux)
- Hover over toolbar buttons to see their shortcuts
- Press `Cmd/Ctrl + ?` or click the help icon to see all shortcuts
- Search supports fuzzy matching - type partial words to find notes

## 🛠 What Makes 9Notes Special?

### 🚀 **Performance Optimized**
- **IndexedDB**: Handles thousands of notes without lag
- **Smart Auto-Save**: Only saves changed content, not everything
- **Code Splitting**: Loads faster with optimized bundles
- **Offline Ready**: Works without internet connection

### 🎯 **Developer Experience**
- **TypeScript**: Full type safety and better development experience
- **Modern React**: Uses latest React 18 features and patterns
- **Component Architecture**: Modular, reusable, and maintainable
- **Responsive Design**: Mobile-first approach with desktop enhancements

### 🔒 **Privacy & Security**
- **Local Storage**: All data stays on your device
- **No Analytics**: We don't track you or collect data
- **No Accounts**: Start using immediately, no sign-up required
- **Open Source**: Fully transparent code you can inspect

## 🏗 Tech Stack

### **Core Technologies**
- **Frontend**: React 18, TypeScript
- **Editor**: TipTap (ProseMirror) - Professional rich text editor
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: Redux with usm-redux decorators
- **Database**: IndexedDB with Dexie.js wrapper

### **Development & Build**
- **Build Tool**: Vite (fast development and optimized builds)
- **Package Manager**: npm/yarn
- **Deployment**: GitHub Pages with automated builds
- **Code Quality**: ESLint, TypeScript strict mode

### **UI/UX Libraries**
- **Icons**: Lucide React (beautiful, consistent icons)
- **Drag & Drop**: @dnd-kit (accessible drag and drop)
- **Animations**: Tailwind CSS animations + transitions
- **Responsive**: Mobile-first responsive design

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.