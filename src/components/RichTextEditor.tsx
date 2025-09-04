import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Bold, 
  Italic, 
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  FileCode,
  Undo,
  Redo
} from 'lucide-react'
import React from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  onEditorReady?: (editor: any) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  return (
    <TooltipProvider>
      <div className="border-b border-border p-1.5 sm:p-2 flex flex-wrap items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 text-xs sm:text-sm touch-manipulation"
              >
                H1
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 text-xs sm:text-sm touch-manipulation"
              >
                H2
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 text-xs sm:text-sm touch-manipulation"
              >
                H3
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 3</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 sm:h-8 mx-1 flex-shrink-0" />

        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('bold') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className="h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 touch-manipulation"
              >
                <Bold className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('italic') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className="h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 touch-manipulation"
              >
                <Italic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('strike') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className="h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 touch-manipulation"
              >
                <Strikethrough className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Strikethrough</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('code') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className="h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 touch-manipulation"
              >
                <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Inline code</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 sm:h-8 mx-1 flex-shrink-0" />

        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className="h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 touch-manipulation"
              >
                <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet list</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className="h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 touch-manipulation"
              >
                <ListOrdered className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered list</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className="h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 touch-manipulation"
              >
                <Quote className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quote</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 sm:h-8 mx-1 flex-shrink-0" />

        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className="h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 touch-manipulation"
              >
                <FileCode className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Code block</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 touch-manipulation"
              >
                <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Horizontal rule</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 sm:h-8 mx-1 flex-shrink-0" />

        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 touch-manipulation disabled:opacity-50"
              >
                <Undo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2 touch-manipulation disabled:opacity-50"
              >
                <Redo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className = "",
  onEditorReady
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: 100000,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none h-full px-3 py-3 sm:px-6 sm:py-4 max-w-none',
      },
    },
  })

  // Update editor content when prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Notify parent when editor is ready
  React.useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  if (!editor) return null

  return (
    <div className={`border border-border rounded-lg bg-background flex flex-col ${className}`}>
      <MenuBar editor={editor} />
      <div className="relative flex-1 cursor-text min-h-0" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}

export default RichTextEditor