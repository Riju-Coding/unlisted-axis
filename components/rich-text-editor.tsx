"use client";

import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function QuillEditor({ value, onChange }: any) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Initialize only once
    if (!quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Start typing...",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "blockquote", "code-block"],
            ["clean"],
          ],
        },
      });

      quillRef.current.on("text-change", () => {
        const html = editorRef.current!.querySelector(".ql-editor")!.innerHTML;
        onChange?.(html);
      });
    }
  }, []);

  // Update editor when parent value changes
  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const editor = quillRef.current.root.innerHTML;
      if (value !== editor) {
        quillRef.current.root.innerHTML = value;
      }
    }
  }, [value]);

  return (
    <div className="border border-gray-300 rounded-md">
      <div ref={editorRef} style={{ minHeight: "200px" }} />
    </div>
  );
}
