import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FileUploadComponent } from "./FileUploadComponent";

export const FileExtension = Node.create({
  name: "fileUploadBlock",
  group: "block",
  atom: true, // Empêche l'édition de texte à l'intérieur

  addAttributes() {
    return {
      fileName: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "file-upload-block" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["file-upload-block", HTMLAttributes];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileUploadComponent);
  },
});
