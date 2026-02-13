"use client";

import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";

import { MenuBar } from "./MenuBar";

type Props = {
  lesson: {
    name: string | null;
    id: string | null;
    content: string | null;
    image: string | null;
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
      Superscript,
      Subscript,
      TableCell,
      // Dans tes extensions :
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
        alignments: ["left", "center", "right"],
        defaultAlignment: "left",
      }),
      Image.configure({
        resize: {
          enabled: true,
          alwaysPreserveAspectRatio: true,
          directions: ["top", "bottom", "left", "right"],
          minWidth: 50,
          minHeight: 50,
        },
        allowBase64: true,
      }),

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
    if (
      editor &&
      lesson.content !== null &&
      editor.getHTML() !== lesson.content
    ) {
      editor.commands.setContent(lesson.content);
    }
  }, [lesson.content, editor]);

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col bg-white shadow-inner overflow-hidden">
        <div className="bg-white border-b border-blue-100 flex-none">
          <MenuBar editor={editor} lesson={lesson} />
        </div>

        <div className="flex-1 overflow-hidden">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
    </div>
  );
};

export default SimpleEditor;
