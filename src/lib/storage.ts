"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]);

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function uploadImage(file: File, folder: string, name: string): Promise<string> {
  if (!ALLOWED_MIME.has(file.type)) throw new Error("Type de fichier non supporté");
  const ext = file.type.split("/")[1];
  const filename = `${name}-${Date.now()}.${ext}`;

  if (useBlob) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${folder}/${filename}`, file, { access: "public" });
    return blob.url;
  }

  // Local fallback: write to /public/
  const publicFolder = join(process.cwd(), "public", folder);
  await mkdir(publicFolder, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(publicFolder, filename), buffer);
  return `/${folder}/${filename}`;
}

export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url) return;

  if (url.startsWith("https://")) {
    const { del } = await import("@vercel/blob");
    await del(url).catch(() => {});
    return;
  }

  // Local: delete from /public/
  if (url.startsWith("/")) {
    const { unlink } = await import("fs/promises");
    await unlink(join(process.cwd(), "public", url)).catch(() => {});
  }
}
