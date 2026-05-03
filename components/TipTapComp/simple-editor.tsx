"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { ResizableImageExtension } from "./ResizableImageExtension";
import { MenuBar } from "./MenuBar";
import { AlignLeft, AlignCenter, AlignRight, Maximize2, Trash2 } from "lucide-react";

/* ─── Floating image toolbar ─────────────────────────────────────────────── */

type ToolbarState = {
  top: number;
  left: number;
  align: "left" | "center" | "right" | "full";
  width: number | null;
};

function useImageToolbar(editor: Editor | null): ToolbarState | null {
  const [state, setState] = useState<ToolbarState | null>(null);

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      if (!editor.isActive("image")) {
        setState(null);
        return;
      }

      const { from } = editor.state.selection;
      const dom = editor.view.nodeDOM(from);
      const el = dom instanceof Element ? dom : (dom as Node)?.parentElement;
      if (!el) { setState(null); return; }

      const img = el.querySelector("img") ?? el;
      const rect = (img as Element).getBoundingClientRect();
      const attrs = editor.getAttributes("image");

      setState({
        top: rect.top + window.scrollY - 52,
        left: rect.left + window.scrollX + rect.width / 2,
        align: attrs.align ?? "center",
        width: attrs.width ?? null,
      });
    };

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    window.addEventListener("scroll", update, true);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [editor]);

  return state;
}

function ImageFloatingToolbar({ editor }: { editor: Editor }) {
  const toolbar = useImageToolbar(editor);

  if (!toolbar) return null;

  const align = toolbar.align;

  const btnBase =
    "p-1.5 rounded-md transition-colors cursor-pointer";
  const btnActive = "bg-blue-600 text-white";
  const btnIdle = "text-slate-600 hover:bg-slate-100 hover:text-blue-600";

  const setAlign = (a: "left" | "center" | "right" | "full") =>
    editor.chain().focus().updateAttributes("image", { align: a }).run();

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: toolbar.top,
        left: toolbar.left,
        transform: "translateX(-50%)",
        zIndex: 9999,
      }}
      onMouseDown={(e) => e.preventDefault()}
      className="bg-white border border-slate-200 rounded-xl shadow-2xl flex items-center gap-0.5 px-2 py-1.5 select-none"
    >
      <button
        className={`${btnBase} ${align === "left" ? btnActive : btnIdle}`}
        onClick={() => setAlign("left")}
        title="Flotter à gauche"
      >
        <AlignLeft size={14} />
      </button>
      <button
        className={`${btnBase} ${align === "center" ? btnActive : btnIdle}`}
        onClick={() => setAlign("center")}
        title="Centrer"
      >
        <AlignCenter size={14} />
      </button>
      <button
        className={`${btnBase} ${align === "right" ? btnActive : btnIdle}`}
        onClick={() => setAlign("right")}
        title="Flotter à droite"
      >
        <AlignRight size={14} />
      </button>
      <button
        className={`${btnBase} ${align === "full" ? btnActive : btnIdle}`}
        onClick={() => setAlign("full")}
        title="Pleine largeur"
      >
        <Maximize2 size={14} />
      </button>

      {toolbar.width && (
        <>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <span className="text-[11px] text-slate-400 font-mono px-1 min-w-10 text-center">
            {toolbar.width}px
          </span>
        </>
      )}

      <div className="w-px h-4 bg-slate-200 mx-1" />
      <button
        className={`${btnBase} text-red-500 hover:bg-red-50`}
        onClick={() => editor.chain().focus().deleteSelection().run()}
        title="Supprimer"
      >
        <Trash2 size={14} />
      </button>
    </div>,
    document.body,
  );
}

/* ─── Editor ─────────────────────────────────────────────────────────────── */

type Props = {
  lesson: {
    id: string;
    title: string;
    teacherId: string;
    teacherName: string;
    content: string;
    image: string;
    classes: { id: string; name?: string }[];
  };
};

const SimpleEditor = ({ lesson }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      TextStyle,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Superscript,
      Subscript,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
        defaultAlignment: "left",
      }),
      ResizableImageExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer font-medium",
        },
      }),
    ],

    content: lesson.content ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap prose max-w-none focus:outline-none p-12 cursor-text bg-white min-h-full overflow-y-auto",
      },
    },
  });

  React.useEffect(() => {
    if (editor && lesson.content !== null && editor.getHTML() !== lesson.content) {
      editor.commands.setContent(lesson.content);
    }
  }, [lesson.content, editor]);

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden">
      <style>{`
        /* Clearfix après float d'image */
        .tiptap::after { content: ""; display: table; clear: both; }

        /* Assure que le NodeView wrapper d'image ne coupe pas les poignées */
        .tiptap [data-type="image"],
        .tiptap .ProseMirror-selectednode { overflow: visible !important; }

        /* Prose override : on gère la taille via les attrs, pas via prose */
        .tiptap.prose img { margin: 0; max-width: 100%; }
      `}</style>

      {editor && <ImageFloatingToolbar editor={editor} />}

      <div className="flex-1 flex flex-col bg-white shadow-inner overflow-hidden">
        <div className="bg-white border-b border-blue-100 flex-none">
          <MenuBar editor={editor} lesson={lesson} />
        </div>
        <div className="flex-1 overflow-auto">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
    </div>
  );
};

export default SimpleEditor;
