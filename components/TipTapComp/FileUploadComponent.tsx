"use client";
import React from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { Upload } from "lucide-react";

export const FileUploadComponent = ({
  node,
  updateAttributes,
  extension,
}: any) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    

    updateAttributes({
      fileName: file.name,
    });
  };

  return (
    <NodeViewWrapper className="flex justify-center my-8">
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center bg-white w-full max-w-md shadow-sm">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <Upload className="text-red-500 w-10 h-10" />
        </div>
        <h3 className="font-bold text-xl text-slate-800 mb-1">Local File</h3>
        <p className="text-slate-500 text-center text-sm mb-6">
          Upload a document from your computer
        </p>
        <label className="bg-red-600 text-white px-8 py-2.5 rounded-lg font-bold cursor-pointer hover:bg-red-700 transition-colors shadow-md">
          Select File
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </NodeViewWrapper>
  );
};
