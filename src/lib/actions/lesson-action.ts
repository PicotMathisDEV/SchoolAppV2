"use server";

import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { auth } from "../auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export const createLesson = async (
  title: string,
  content: string,
  teacherId: string,
  teacherName: string,
) => {
  if (!title) throw new Error("Nom requis");
  const lesson = await prisma.lesson.create({
    data: {
      title,
      content,
      teacherName,
      teacherId,
    },
  });
  revalidatePath("/create/lesson");
  return lesson;
};

export async function getLessons() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Non autorisé");

  return await prisma.lesson.findMany({
    where: { teacherId: session.user.id },
    include: { classes: { select: { id: true } } },
  });
}

export async function getOneLesson(id: string) {
  return await prisma.lesson.findUnique({
    where: { id },
    include: {
      classes: { select: { id: true } },
    },
  });
}

export async function updateLessonName(id: string, title: string) {
  const updated = await prisma.lesson.update({
    where: { id },
    data: { title },
  });
  revalidatePath("/create/lesson");
  return updated;
}

export async function deleteLesson(id: string) {
  const deleted = await prisma.lesson.delete({
    where: { id },
  });
  revalidatePath("/create/lesson");
  return deleted;
}

export async function updateLessonImage(lessonId: string, formData: FormData) {
  try {
    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0) throw new Error("Aucun fichier");

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public", "lessons");
    await mkdir(uploadDir, { recursive: true });

    const ext = imageFile.type.split("/")[1] ?? "png";
    const fileName = `lesson-${lessonId}-${Date.now()}.${ext}`;
    const uploadPath = path.join(uploadDir, fileName);

    await writeFile(uploadPath, buffer);
    const imageUrl = `/lessons/${fileName}`;

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { image: imageUrl },
    });

    revalidatePath("/create/lesson");
    return { success: true, data: updatedLesson };
  } catch (error) {
    return { success: false, message: "Erreur lors de l'upload" };
    console.log(error);
  }
}

export async function updateLessonClasses(
  lessonId: string,
  classesIds: string[],
) {
  try {
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        classes: {
          set: classesIds.map((id) => ({ id })),
        },
      },
    });

    revalidatePath("/create/lesson");

    return { success: true, data: updatedLesson };
  } catch (error) {
    console.error("Erreur Prisma:", error);
    return { success: false, message: "Erreur lors de la mise à jour" };
  }
}
export async function updateLessonContent(id: string, content: string) {
  try {
    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        content,
      },
    });

    revalidatePath("/create/lesson");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Erreur updateLessonContent:", error);
    return {
      success: false,
      message: "Erreur lors de la mise à jour du contenu",
    };
  }
}
