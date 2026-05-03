"use server";

import { auth } from "@/src/lib/auth";
import prisma from "../prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { uploadImage, deleteImage } from "../storage";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

interface OptionInput {
  text?: string;
  image?: string;
  isCorrect: boolean;
}

interface QuestionInput {
  content: string;
  image?: string;
  options: OptionInput[];
}

async function assertQuizOwner(quizId: string, userId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { teacherId: true },
  });
  if (!quiz || quiz.teacherId !== userId) throw new Error("Non autorisé");
  return quiz;
}

export async function createQuiz(data: { title: string; description?: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "teacher") {
    throw new Error("Seuls les professeurs peuvent créer des quiz");
  }

  const newQuiz = await prisma.quiz.create({
    data: {
      title: data.title,
      description: data.description,
      teacherId: session.user.id,
      image: "/quiz.png",
    },
  });

  revalidatePath("/create/quizz");
  return newQuiz;
}

export async function getQuizzes() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  return await prisma.quiz.findMany({
    where: { teacherId: session.user.id },
    include: {
      classes: { select: { id: true } },
      questions: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOneQuiz(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  return await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: { include: { options: true } },
      classes: true,
    },
  });
}

export async function updateQuizMeta(
  id: string,
  data: { title?: string; description?: string },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");
  await assertQuizOwner(id, session.user.id);

  const updated = await prisma.quiz.update({ where: { id }, data });
  revalidatePath("/create/quizz");
  revalidatePath(`/create/quizz/${id}`);
  return updated;
}

export async function deleteQuiz(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");
  await assertQuizOwner(id, session.user.id);

  const deleted = await prisma.quiz.delete({ where: { id } });
  revalidatePath("/create/quizz");
  return deleted;
}

export async function updateQuizImage(quizId: string, formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Non autorisé");
    await assertQuizOwner(quizId, session.user.id);

    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0) throw new Error("Aucun fichier");
    if (!ALLOWED_MIME.has(imageFile.type)) throw new Error("Type de fichier non supporté");

    const existing = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { image: true },
    });

    const imageUrl = await uploadImage(imageFile, "quizzes", `quiz-${quizId}`);

    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: { image: imageUrl },
    });

    await deleteImage(existing?.image);

    revalidatePath("/create/quizz");
    revalidatePath(`/create/quizz/${quizId}`);
    return { success: true, data: updatedQuiz };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erreur lors de l'upload" };
  }
}

export async function updateQuizClasses(quizId: string, classIds: string[]) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Non autorisé");
    await assertQuizOwner(quizId, session.user.id);

    const updated = await prisma.quiz.update({
      where: { id: quizId },
      data: { classes: { set: classIds.map((id) => ({ id })) } },
    });
    revalidatePath("/create/quizz");
    revalidatePath(`/create/quizz/${quizId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erreur lors de la mise à jour" };
  }
}

export async function updateQuizQuestions(
  quizId: string,
  questions: QuestionInput[],
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Non autorisé");
    await assertQuizOwner(quizId, session.user.id);

    await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({ where: { quizId } });
      await tx.quiz.update({
        where: { id: quizId },
        data: {
          questions: {
            create: questions.map((q) => ({
              content: q.content,
              image: q.image || null,
              options: {
                create: q.options.map((o) => ({
                  text: o.text && o.text.trim() !== "" ? o.text : null,
                  image: o.image && o.image !== "" ? o.image : null,
                  isCorrect: o.isCorrect,
                })),
              },
            })),
          },
        },
      });
    });

    revalidatePath(`/create/quizz/${quizId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}
