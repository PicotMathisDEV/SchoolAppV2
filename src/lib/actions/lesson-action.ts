"use server";

import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { auth } from "../auth";
import { revalidatePath } from "next/cache";
import { uploadImage, deleteImage } from "../storage";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

async function assertLessonOwner(lessonId: string, userId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { teacherId: true },
  });
  if (!lesson || lesson.teacherId !== userId) throw new Error("Non autorisé");
  return lesson;
}

export const createLesson = async (
  title: string,
  content: string,
  teacherId: string,
  teacherName: string,
) => {
  if (!title) throw new Error("Nom requis");
  const lesson = await prisma.lesson.create({
    data: { title, content, teacherName, teacherId },
  });
  revalidatePath("/create/lesson");
  return lesson;
};

export async function getLessons() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  return await prisma.lesson.findMany({
    where: { teacherId: session.user.id },
    include: { classes: { select: { id: true } } },
  });
}

export async function getOneLesson(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  return await prisma.lesson.findUnique({
    where: { id },
    include: { classes: { select: { id: true } } },
  });
}

export async function updateLessonName(id: string, title: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");
  await assertLessonOwner(id, session.user.id);

  const updated = await prisma.lesson.update({ where: { id }, data: { title } });
  revalidatePath("/create/lesson");
  return updated;
}

export async function deleteLesson(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");
  await assertLessonOwner(id, session.user.id);

  const deleted = await prisma.lesson.delete({ where: { id } });
  revalidatePath("/create/lesson");
  return deleted;
}

export async function updateLessonImage(lessonId: string, formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Non autorisé");
    await assertLessonOwner(lessonId, session.user.id);

    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0) throw new Error("Aucun fichier");
    if (!ALLOWED_MIME.has(imageFile.type)) throw new Error("Type de fichier non supporté");

    const existing = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { image: true },
    });

    const imageUrl = await uploadImage(imageFile, "lessons", `lesson-${lessonId}`);

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { image: imageUrl },
    });

    await deleteImage(existing?.image);

    revalidatePath("/create/lesson");
    return { success: true, data: updatedLesson };
  } catch (error) {
    console.error("[lesson] updateLessonImage:", error);
    return { success: false, message: "Erreur lors de l'upload" };
  }
}

export async function updateLessonClasses(lessonId: string, classesIds: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");
  await assertLessonOwner(lessonId, session.user.id);

  try {
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { classes: { set: classesIds.map((id) => ({ id })) } },
    });
    revalidatePath("/create/lesson");
    return { success: true, data: updatedLesson };
  } catch (error) {
    console.error("[lesson] updateLessonClasses:", error);
    return { success: false, message: "Erreur lors de la mise à jour" };
  }
}

export async function uploadLessonContentImage(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  const imageFile = formData.get("image") as File | null;
  if (!imageFile || imageFile.size === 0) throw new Error("Aucun fichier");
  if (!ALLOWED_MIME.has(imageFile.type)) throw new Error("Type de fichier non supporté");

  return await uploadImage(imageFile, "lessons/content", `content-${session.user.id}`);
}

export async function getLessonForStudent(lessonId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      classes: {
        include: { students: { select: { id: true } } },
      },
    },
  });

  if (!lesson) throw new Error("Leçon introuvable");

  const isTeacher = lesson.teacherId === session.user.id;
  const isStudentViaClass = lesson.classes.some((c) =>
    c.students.some((s) => s.id === session.user.id),
  );

  let isStudentViaParcours = false;
  if (!isTeacher && !isStudentViaClass) {
    const step = await prisma.parcoursStep.findFirst({
      where: {
        lessonId,
        parcours: {
          classes: { some: { students: { some: { id: session.user.id } } } },
        },
      },
    });
    isStudentViaParcours = !!step;
  }

  if (!isTeacher && !isStudentViaClass && !isStudentViaParcours)
    throw new Error("Accès refusé");

  return {
    id: lesson.id,
    title: lesson.title,
    image: lesson.image,
    content: lesson.content,
    teacherName: lesson.teacherName,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  };
}

export async function updateLessonContent(id: string, content: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");
  await assertLessonOwner(id, session.user.id);

  try {
    const updated = await prisma.lesson.update({ where: { id }, data: { content } });
    revalidatePath("/create/lesson");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[lesson] updateLessonContent:", error);
    return { success: false, message: "Erreur lors de la mise à jour du contenu" };
  }
}
