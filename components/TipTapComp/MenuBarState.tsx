import type { Editor } from "@tiptap/core";

export interface MenuBarContext {
  editor: Editor | null;
}

export function menuBarStateSelector(ctx: MenuBarContext) {
  const defaultState = {
    canUndo: false,
    canRedo: false,
    isBold: false,
    isItalic: false,
    isStrike: false,
    isCode: false,
    isLink: false,
    isParagraph: false,
    isHeading1: false,
    isHeading2: false,
    isHeading3: false,
    isHeading4: false,
    isHeading5: false,
    isHeading6: false,
    isTextAlignLeft: false,
    isTextAlignCenter: false,
    isTextAlignRight: false,
    isBulletList: false,
    isOrderedList: false,
    isBlockquote: false,
    isCodeBlock: false,
    isTable: false,
  };

  if (!ctx.editor) return defaultState;
  const { editor: e } = ctx;

  return {
    canUndo: e.can().undo(),
    canRedo: e.can().redo(),
    isBold: e.isActive("bold"),
    isItalic: e.isActive("italic"),
    isStrike: e.isActive("strike"),
    isCode: e.isActive("code"),
    isLink: e.isActive("link"),
    isParagraph: e.isActive("paragraph"),
    isHeading1: e.isActive("heading", { level: 1 }),
    isHeading2: e.isActive("heading", { level: 2 }),
    isHeading3: e.isActive("heading", { level: 3 }),
    isHeading4: e.isActive("heading", { level: 4 }),
    isHeading5: e.isActive("heading", { level: 5 }),
    isHeading6: e.isActive("heading", { level: 6 }),
    isTextAlignLeft:
      e.isActive({ textAlign: "left" }) || e.isActive({ textAlign: "start" }),
    isTextAlignCenter: e.isActive({ textAlign: "center" }),
    isTextAlignRight: e.isActive({ textAlign: "right" }),
    isBulletList: e.isActive("bulletList"),
    isOrderedList: e.isActive("orderedList"),
    isBlockquote: e.isActive("blockquote"),
    isCodeBlock: e.isActive("codeBlock"),
    isTable: e.isActive("table"),
  };
}
