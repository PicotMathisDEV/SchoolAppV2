"use client";

import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import React, { useCallback, useRef } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code2,
  Undo2,
  Redo2,
  Eraser,
  Table as TableIcon,
  ArrowRightToLine,
  ArrowDownToLine,
  Trash2,
  Link as LinkIcon,
  Image as ImageIcon,
  Ban,
  Save,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Superscript,
  Subscript,
} from "lucide-react";
import { menuBarStateSelector } from "./MenuBarState";
import { updateLessonContent } from "@/src/lib/actions/lesson-action";
import { toast } from "sonner";

type MenuBarProps = {
  editor: Editor | null;
  lesson: {
    name: string | null;
    id: string;
    content: string | null;
    image: string | null;
  };
};

const MenuButton = ({
  onClick,
  isActive,
  disabled,
  children,
  title,
  danger,
}: any) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    disabled={disabled}
    title={title}
    className={`p-1.5 md:p-2 rounded-md transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : danger
          ? "text-red-500 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
    } ${disabled ? "opacity-20 cursor-not-allowed" : "cursor-pointer active:scale-90"}`}
  >
    {React.cloneElement(children as React.ReactElement, { size: 16 })}
  </button>
);

export const MenuBar = ({ editor, lesson }: MenuBarProps) => {
  const state = useEditorState({ editor, selector: menuBarStateSelector });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!editor) return;
    try {
      const currentHTML = editor.getHTML();
      await updateLessonContent(lesson.id, currentHTML);
      toast.success("Enregistré");
    } catch (err) {
      console.error("Erreur Prisma/Action:", err);
      toast.error("Erreur");
    }
  };

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL du lien :", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor
          .chain()
          .focus()
          .setImage({ src: e.target?.result as string })
          .run();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!editor || !state) return null;

  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 w-full p-2">
      <div className="max-w-350 mx-auto px-6 flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
            <MenuButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!state.canUndo}
              title="Annuler"
            >
              <Undo2 />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!state.canRedo}
              title="Rétablir"
            >
              <Redo2 />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={state.isBold}
              title="Gras"
            >
              <Bold />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={state.isItalic}
              title="Italique"
            >
              <Italic />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={state.isStrike}
              title="Barré"
            >
              <Strikethrough />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              isActive={state.isSuperscript}
              title="Exposant"
            >
              <Superscript />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              isActive={state.isSubscript}
              title="Indice"
            >
              <Subscript />
            </MenuButton>
          </div>
        </div>

        {/* Titres & Alignement */}
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              isActive={state.isHeading1}
              title="H1"
            >
              <Heading1 />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              isActive={state.isHeading2}
              title="H2"
            >
              <Heading2 />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              isActive={state.isHeading3}
              title="H3"
            >
              <Heading3 />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 4 }).run()
              }
              isActive={state.isHeading4}
              title="H4"
            >
              <Heading4 />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={state.isTextAlignLeft}
              title="Gauche"
            >
              <AlignLeft />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              isActive={state.isTextAlignCenter}
              title="Centre"
            >
              <AlignCenter />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={state.isTextAlignRight}
              title="Droite"
            >
              <AlignRight />
            </MenuButton>
          </div>
        </div>

        {/* Listes & Médias */}
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={state.isBulletList}
              title="Puces"
            >
              <List />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={state.isOrderedList}
              title="Ordonnée"
            >
              <ListOrdered />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={state.isBlockquote}
              title="Citation"
            >
              <Quote />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={state.isCodeBlock}
              title="Code"
            >
              <Code2 />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
            <MenuButton onClick={setLink} isActive={state.isLink} title="Lien">
              <LinkIcon />
            </MenuButton>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <MenuButton
              onClick={() => fileInputRef.current?.click()}
              title="Image"
            >
              <ImageIcon />
            </MenuButton>
          </div>
        </div>

        {/* Tableaux & Nettoyage */}
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <div className="flex items-center gap-0.5 bg-emerald-50/50 p-1 rounded-lg border border-emerald-100 shadow-sm">
            <MenuButton
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
              title="Tableau"
            >
              <TableIcon />
            </MenuButton>
            {state.isTable && (
              <>
                <MenuButton
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  title="+ Col"
                >
                  <ArrowRightToLine />
                </MenuButton>
                <MenuButton
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  title="+ Ligne"
                >
                  <ArrowDownToLine />
                </MenuButton>
                <MenuButton
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  title="Supprimer"
                  danger
                >
                  <Trash2 />
                </MenuButton>
              </>
            )}
          </div>

          <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
            <MenuButton
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
              title="Nettoyer styles"
            >
              <Eraser />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().clearNodes().run()}
              title="Reset blocs"
            >
              <Ban />
            </MenuButton>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-600 hover:text-white transition-all active:scale-95 shrink-0 shadow-sm"
        >
          <Save size={14} />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Sauvegarder
          </span>
        </button>
      </div>
    </div>
  );
};
