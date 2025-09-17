"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  LinkIcon,
  ImageIcon,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
      execCommand("insertHTML", linkHtml)
      setLinkUrl("")
      setLinkText("")
      setIsLinkDialogOpen(false)
    }
  }

  const insertImage = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      const imageHtml = `<img src="${url}" alt="Image" style="max-width: 100%; height: auto; margin: 10px 0;" />`
      execCommand("insertHTML", imageHtml)
    }
  }

  const formatButtons = [
    { command: "bold", icon: Bold, title: "Bold" },
    { command: "italic", icon: Italic, title: "Italic" },
    { command: "underline", icon: Underline, title: "Underline" },
    { command: "insertUnorderedList", icon: List, title: "Bullet List" },
    { command: "insertOrderedList", icon: ListOrdered, title: "Numbered List" },
    { command: "formatBlock", icon: Quote, title: "Quote", value: "blockquote" },
    { command: "insertHorizontalRule", icon: Code, title: "Horizontal Rule" },
  ]

  const alignButtons = [
    { command: "justifyLeft", icon: AlignLeft, title: "Align Left" },
    { command: "justifyCenter", icon: AlignCenter, title: "Align Center" },
    { command: "justifyRight", icon: AlignRight, title: "Align Right" },
  ]

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
        {/* Format Buttons */}
        {formatButtons.map((button) => (
          <Button
            key={button.command}
            variant="ghost"
            size="sm"
            onClick={() => execCommand(button.command, button.value)}
            title={button.title}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}

        <div className="w-px h-6 bg-border mx-1" />

        {/* Alignment Buttons */}
        {alignButtons.map((button) => (
          <Button
            key={button.command}
            variant="ghost"
            size="sm"
            onClick={() => execCommand(button.command)}
            title={button.title}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}

        <div className="w-px h-6 bg-border mx-1" />

        {/* Link Button */}
        <Button variant="ghost" size="sm" onClick={() => setIsLinkDialogOpen(true)} title="Insert Link">
          <LinkIcon className="h-4 w-4" />
        </Button>

        {/* Image Button */}
        <Button variant="ghost" size="sm" onClick={insertImage} title="Insert Image">
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <Button variant="ghost" size="sm" onClick={() => execCommand("undo")} title="Undo">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => execCommand("redo")} title="Redo">
          <Redo className="h-4 w-4" />
        </Button>

        {/* Heading Dropdown */}
        <select
          onChange={(e) => execCommand("formatBlock", e.target.value)}
          className="px-2 py-1 text-sm border rounded"
          defaultValue=""
        >
          <option value="">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className={cn(
          "min-h-[400px] p-4 focus:outline-none prose prose-sm max-w-none",
          "prose-headings:mt-4 prose-headings:mb-2",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground prose-blockquote:pl-4 prose-blockquote:italic",
          !value && "text-muted-foreground",
        )}
        data-placeholder={placeholder}
        style={{
          minHeight: "400px",
        }}
        suppressContentEditableWarning={true}
      />

      {/* Link Dialog */}
      {isLinkDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Enter link text"
                />
              </div>
              <div>
                <label className="text-sm font-medium">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={insertLink}>Insert Link</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
