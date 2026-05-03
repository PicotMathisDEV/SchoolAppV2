"use client";

import { Image } from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/core";
import { GripVertical } from "lucide-react";
import { useCallback, useRef } from "react";

function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, title, width, align } = node.attrs as {
    src: string;
    alt: string | null;
    title: string | null;
    width: number | null;
    align: "left" | "center" | "right" | "full";
  };

  const imgRef = useRef<HTMLImageElement>(null);

  const startResize = useCallback(
    (e: React.MouseEvent, dir: "left" | "right") => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startW = imgRef.current?.offsetWidth ?? (width ?? 400);

      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        const next = Math.max(60, Math.round(startW + (dir === "right" ? delta : -delta)));
        updateAttributes({ width: next });
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [width, updateAttributes],
  );

  const wrapperStyle: React.CSSProperties =
    align === "left"
      ? { float: "left", margin: "4px 20px 8px 0", display: "inline-block" }
      : align === "right"
        ? { float: "right", margin: "4px 0 8px 20px", display: "inline-block" }
        : align === "full"
          ? { display: "block", width: "100%", margin: "8px 0", clear: "both" }
          : { display: "flex", justifyContent: "center", margin: "8px 0", clear: "both" };

  const imgWidth =
    align === "full" ? "100%" : width ? `${width}px` : "auto";

  return (
    <NodeViewWrapper style={wrapperStyle}>

      <div
        className={`relative inline-block select-none transition-shadow duration-150 ${
          selected ? "ring-2 ring-blue-500 ring-offset-2 rounded-[3px]" : ""
        }`}
        style={{ width: align === "full" ? "100%" : "auto" }}
      >

        <img
          ref={imgRef}
          src={src}
          alt={alt ?? ""}
          title={title ?? ""}
          style={{ width: imgWidth, maxWidth: "100%", display: "block" }}
          draggable={false}
        />

        {selected && align !== "full" && (
          <>

            <div
              onMouseDown={(e) => startResize(e, "left")}
              className="absolute top-1/2 -left-2.5 -translate-y-1/2
                         w-4 h-12 rounded-full
                         bg-blue-500 hover:bg-blue-600
                         cursor-ew-resize shadow-lg
                         flex items-center justify-center
                         transition-colors z-50"
            >
              <GripVertical size={10} className="text-white" />
            </div>

            <div
              onMouseDown={(e) => startResize(e, "right")}
              className="absolute top-1/2 -right-2.5 -translate-y-1/2
                         w-4 h-12 rounded-full
                         bg-blue-500 hover:bg-blue-600
                         cursor-ew-resize shadow-lg
                         flex items-center justify-center
                         transition-colors z-50"
            >
              <GripVertical size={10} className="text-white" />
            </div>

            <div
              onMouseDown={(e) => startResize(e, "right")}
              className="absolute -bottom-2 -right-2
                         w-4 h-4 rounded-sm
                         bg-blue-500 hover:bg-blue-600
                         cursor-nwse-resize shadow-md
                         border-2 border-white
                         transition-colors z-50"
            />

            <div
              onMouseDown={(e) => startResize(e, "left")}
              className="absolute -bottom-2 -left-2
                         w-4 h-4 rounded-sm
                         bg-blue-500 hover:bg-blue-600
                         cursor-nesw-resize shadow-md
                         border-2 border-white
                         transition-colors z-50"
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const ResizableImageExtension = Image.extend({
  name: "image",

  addAttributes() {
    return {
      src:   { default: null },
      alt:   { default: null },
      title: { default: null },
      width: {
        default: null,
        parseHTML: (el) => {
          const w = el.getAttribute("width") ?? el.style.width;
          return w ? parseInt(w, 10) || null : null;
        },
        renderHTML: ({ width }) =>
          width ? { width: String(width), style: `width:${width}px` } : {},
      },
      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") ?? "center",
        renderHTML: ({ align }) => ({ "data-align": align }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
