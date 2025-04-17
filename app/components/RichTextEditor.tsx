import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const RichTextEditor = ({ content, onChange, placeholder = 'Write your notes here...' }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'mb-2',
          },
        },
        hardBreak: {
          keepMarks: true,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px]',
      },
    },
  })

  // Update editor content when prop changes (e.g. after refresh)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap gap-1 rounded-t-lg border-b border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive('bold')
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Bold (Ctrl+B)"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive('italic')
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Italic (Ctrl+I)"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="4" x2="10" y2="4"></line>
            <line x1="14" y1="20" x2="5" y2="20"></line>
            <line x1="15" y1="4" x2="9" y2="20"></line>
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive('strike')
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Strikethrough"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.15,9.35c0.17-0.77,0.26-1.57,0.26-2.35c0-3.87-3.13-7-7-7S3.41,3.13,3.41,7c0,0.78,0.09,1.58,0.26,2.35" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <path d="M17.15,14.65c-0.17,0.77-0.26,1.57-0.26,2.35c0,3.87-3.13,7-7,7s-7-3.13-7-7c0-0.78,0.09-1.58,0.26-2.35" />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive('code')
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Code"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive('bulletList')
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Bullet List"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="9" y1="6" x2="20" y2="6"></line>
            <line x1="9" y1="12" x2="20" y2="12"></line>
            <line x1="9" y1="18" x2="20" y2="18"></line>
            <circle cx="5" cy="6" r="2"></circle>
            <circle cx="5" cy="12" r="2"></circle>
            <circle cx="5" cy="18" r="2"></circle>
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive('orderedList')
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Numbered List"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4"></path>
            <path d="M4 10h2"></path>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
          </svg>
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

        <button
          onClick={() => {
            const url = window.prompt('Enter the URL')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive('link')
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Add Link"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>
      </div>

      {/* Editor Content */}
      <div className="rounded-b-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-4 focus:outline-none dark:prose-invert [&_p]:my-0 [&_p]:leading-normal"
        />
      </div>
    </div>
  )
}

export default RichTextEditor 