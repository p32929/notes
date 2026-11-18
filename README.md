# 9Notes

A fast, clean notes app that runs in your browser and works offline. No account, no ads, and your notes never leave your device.

**Open it:** https://p32929.github.io/notes/

Most note apps want you to sign up, sync to their server or show you ads. 9Notes just opens: after the first visit it works with no internet at all, saves as you type, and keeps everything in your own browser. You can also install it like an app on your phone or computer.

## Screenshots

### Rich text editor

<img width="3024" height="1714" alt="9Notes - Rich Text Editor with formatting toolbar, sidebar navigation, and auto-save status" src="https://github.com/user-attachments/assets/4486b6ce-ec66-4ac1-85c5-fccd50d1eb07" />

### Themes and settings

<img width="3024" height="1714" alt="9Notes - Settings panel showing theme options, color schemes, and import/export functionality" src="https://github.com/user-attachments/assets/dddb9c36-a73c-486f-9ebe-e44b3050299b" />

### Fast search

<img width="3024" height="1714" alt="9Notes - Search dialog with fuzzy matching, showing search results and keyboard navigation" src="https://github.com/user-attachments/assets/74dc49b8-48e4-4f89-8e02-43374e13f8fa" />

## Features

1. **Works offline:** after the first visit it needs no internet, so it is handy on flights and trips.
2. **Install it like an app** on your phone or computer (Add to Home Screen, or Settings → Install App).
3. **Private:** no account and no sign-up. Notes are stored in your browser (IndexedDB) and save themselves as you type.
4. **Rich text editor** with a formatting toolbar: headings, lists, quotes, code blocks, bold, italic and more.
5. **Fuzzy search** finds notes by title or text, even with partial or misspelled words.
6. **Drag and drop** to reorder your notes.
7. **Keyboard shortcuts** for almost everything, on Mac, Windows and Linux.
8. **Light, dark or system theme,** with 8 colour schemes.
9. **Import and export** your notes as a JSON file, to back up or move them.

## Quick start

1. Open https://p32929.github.io/notes/ in any browser.
2. Press `Cmd/Ctrl + K` to make your first note.
3. To install it, accept your browser's install prompt, or go to Settings → Install App.

## Keyboard shortcuts

Press `Cmd/Ctrl + ?` or click the help icon to see all of them in the app. Hover over a toolbar button to see its shortcut.

| Shortcut | What it does |
|---|---|
| `Cmd/Ctrl + K` | New note |
| `Cmd/Ctrl + F` | Search notes |
| `Cmd/Ctrl + S` | Save now (it also saves by itself) |
| `Cmd/Ctrl + D` | Delete the current note |
| `Option/Alt + ↑/↓` | Move between notes |
| `Escape` | Close any dialog |
| `Cmd/Ctrl + B` | Bold |
| `Cmd/Ctrl + Shift + I` | Italic |
| `Cmd/Ctrl + Shift + S` | Strikethrough |
| `Cmd/Ctrl + 1` / `2` / `3` | Heading 1, 2 or 3 |
| `Cmd/Ctrl + Shift + L` | Bullet list |
| `Cmd/Ctrl + Shift + O` | Numbered list |
| `Cmd/Ctrl + Shift + Q` | Quote |
| `Cmd/Ctrl + Shift + C` | Code block |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Y` or `Cmd + Shift + Z` | Redo |
| `Tab` / `Shift + Tab` | Indent or outdent a list |

## Run it yourself

You need Node.js 18 or newer.

```bash
git clone https://github.com/p32929/notes.git
cd notes
npm install
npm run dev
```

It opens at `http://localhost:4000`. Build it with `npm run build` and try the build with `npm run preview`.

## Publish to GitHub Pages

1. Turn on Pages in your repository and set the source to the `gh-pages` branch.
2. Run `npm run deploy`. It builds the app with offline support and pushes it to `gh-pages`.
3. It goes live at `https://<your-username>.github.io/notes/`.

## Built with

React and TypeScript, the TipTap editor, Tailwind CSS with Radix UI, IndexedDB through Dexie, and Vite.

## License

MIT License.

## Contributing

Contributions are very welcome, thank you! Before you start on a pull request, please open an issue and tell me what you would like to add or change. That way we can agree on it first, and your time is not wasted on something that might not fit.

## You might also like

<p><a href="https://openstore.pfay.workers.dev/more/p32929/notes/personal/0"><picture><source media="(prefers-color-scheme: dark)" srcset="https://openstore.pfay.workers.dev/more/p32929/notes/personal/0-dark.svg"><img src="https://openstore.pfay.workers.dev/more/p32929/notes/personal/0-light.svg" width="50%" align="top" alt="More apps by p32929 on OpenStore (1)"></picture></a><a href="https://openstore.pfay.workers.dev/more/p32929/notes/personal/1"><picture><source media="(prefers-color-scheme: dark)" srcset="https://openstore.pfay.workers.dev/more/p32929/notes/personal/1-dark.svg"><img src="https://openstore.pfay.workers.dev/more/p32929/notes/personal/1-light.svg" width="50%" align="top" alt="More apps by p32929 on OpenStore (2)"></picture></a><br><a href="https://openstore.pfay.workers.dev/more/p32929/notes/personal/2"><picture><source media="(prefers-color-scheme: dark)" srcset="https://openstore.pfay.workers.dev/more/p32929/notes/personal/2-dark.svg"><img src="https://openstore.pfay.workers.dev/more/p32929/notes/personal/2-light.svg" width="50%" align="top" alt="More apps by p32929 on OpenStore (3)"></picture></a><a href="https://openstore.pfay.workers.dev/more/p32929/notes/personal/3"><picture><source media="(prefers-color-scheme: dark)" srcset="https://openstore.pfay.workers.dev/more/p32929/notes/personal/3-dark.svg"><img src="https://openstore.pfay.workers.dev/more/p32929/notes/personal/3-light.svg" width="50%" align="top" alt="More apps by p32929 on OpenStore (4)"></picture></a></p>

<p><a href="https://p32929.github.io/share/?repo=notes"><picture><source media="(prefers-color-scheme: dark)" srcset="https://p32929.github.io/readme/footer-share-dark.svg"><img src="https://p32929.github.io/readme/footer-share-light.svg" width="50%" align="top" alt="Share this project with your friends in one click"></picture></a><a href="https://p32929.github.io/support/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://p32929.github.io/readme/footer-support-dark.svg"><img src="https://p32929.github.io/readme/footer-support-light.svg" width="50%" align="top" alt="If you like my work and want to support me, feel free to support"></picture></a><br><a href="https://openstore.pfay.workers.dev/add"><picture><source media="(prefers-color-scheme: dark)" srcset="https://p32929.github.io/readme/footer-join-dark.svg"><img src="https://p32929.github.io/readme/footer-join-light.svg" width="100%" align="top" alt="Put your own apps on OpenStore: free, your listing lives in your own repo"></picture></a></p>
