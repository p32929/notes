# Notes

A modern, **offline-first** note-taking application that works entirely in your browser. No internet required, no accounts needed, no data leaves your device. Built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

### 🌐 **Offline-First PWA**
- Works completely offline after first visit
- Installable on mobile/desktop (Add to Home Screen)
- No accounts, no sign-up, privacy-focused
- IndexedDB storage with auto-save

### ✨ **Key Features**
- Rich text editor with formatting toolbar
- Real-time fuzzy search through all notes
- Drag & drop note reordering  
- 50+ keyboard shortcuts with cross-platform support
- Multiple themes (Light/Dark) with 8 color schemes
- Import/Export notes as JSON
- Responsive design for mobile & desktop

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
1. Visit https://p32929.github.io/notes/ in any browser
2. Works offline after first visit - perfect for flights, travel
3. Install: Look for browser install prompt, or go to Settings → "Install App"
4. Press `Cmd/Ctrl + K` to create your first note

### **Key Shortcuts**
- `Cmd/Ctrl + K` - New note
- `Cmd/Ctrl + F` - Search notes
- `Cmd/Ctrl + B` - Bold text
- `Option/Alt + ↑/↓` - Navigate notes
- `Cmd/Ctrl + 1/2/3` - Headers

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
1. Build the app for production with PWA support (service worker, manifest)
2. Generate offline-capable assets with correct base path
3. Push the built files to the `gh-pages` branch
4. GitHub Pages will automatically serve the PWA from that branch

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
- `Cmd/Ctrl + Shift + S` - ~~Strikethrough~~ text

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

Contributions are warmly welcomed and greatly appreciated! Whether it's a bug fix, new feature, or improvement, your input helps make this project better for everyone.

Before submitting a pull request, please:

1. Create an issue describing the feature or bug fix you'd like to work on
2. Wait for discussion and approval to ensure alignment with project goals
3. Fork the repository and create your feature branch
4. Submit your pull request with a clear description of changes

This approach helps avoid duplicate efforts and ensures smooth collaboration. Thank you for considering contributing!

## 🔗 Share

Sharing this repository with your friends is just one click away from here

[![facebook](https://user-images.githubusercontent.com/6418354/179013321-ac1d1452-0689-493f-9066-940cf2302b6e.png)](https://www.facebook.com/sharer/sharer.php?u=https://github.com/p32929/notes/)
[![twitter](https://user-images.githubusercontent.com/6418354/179013351-7d8d6d1c-4ce2-46ab-bef8-4c4765a1b888.png)](https://twitter.com/intent/tweet?url=https://github.com/p32929/notes/)
[![tumblr](https://user-images.githubusercontent.com/6418354/179013343-3111f55a-3b90-40c7-8487-9777348672b0.png)](https://www.tumblr.com/share?v=3&u=https://github.com/p32929/notes/)
[![pocket](https://user-images.githubusercontent.com/6418354/179013334-b095c45f-becf-49f4-9ee1-5a731a9b1f85.png)](https://getpocket.com/save?url=https://github.com/p32929/notes/)
[![pinterest](https://user-images.githubusercontent.com/6418354/179013331-44cd9206-11b1-4b65-becb-5863b61c828f.png)](https://pinterest.com/pin/create/button/?url=https://github.com/p32929/notes/)
[![reddit](https://user-images.githubusercontent.com/6418354/179013338-7416ae3f-73ba-4522-86e1-1374d7082d22.png)](https://www.reddit.com/submit?url=https://github.com/p32929/notes/)
[![linkedin](https://user-images.githubusercontent.com/6418354/179013327-ca7b7102-1da8-4b1c-858f-1a6e5f21bd70.png)](https://www.linkedin.com/shareArticle?mini=true&url=https://github.com/p32929/notes/)
[![whatsapp](https://user-images.githubusercontent.com/6418354/179013353-f477fa0b-3e6f-4138-a357-c9991b23ff88.png)](https://api.whatsapp.com/send?text=https://github.com/p32929/notes/)

<!-- hire-block -->

---

## 💼 Using this at a company?

I do fixed-price delivery work on my own projects. One invoice, one date, no hourly billing:

| | |
|---|---|
| **White-label build** — this project rebranded, extended and deployed as yours | **$6,500** · 3 weeks |
| **Custom app from scratch** on my own stack, signed and auto-updating | **$12,500** · 6 weeks |
| **Production-hardening sprint** — 72 hours on this project, for your load and your security review | **$999** |
| **Ongoing capacity** — one project-week of my time reserved every month | **$9,000 / month** |

Full details → **[p32929.github.io/hire](https://p32929.github.io/hire/)** · Email **[fayazbinsalam@uberip.com](mailto:fayazbinsalam@uberip.com)** — scoping and quotes are free and I answer within one business day.

### Commercial use of this repo

This repo has **no license file**, which in copyright law means *all rights reserved*.
Personal use, learning and open-source forks: go ahead, just link back. Shipping it inside a
commercial or closed-source product needs a license — **$2,500** for one product, **$9,500**
company-wide and perpetual, signed and issued the same day
([details](https://p32929.github.io/hire/)).
