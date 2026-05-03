"use server";

import prisma from "@/src/lib/prisma";
import { auth } from "../auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");
  return session;
}

async function assertParcoursOwner(parcoursId: string, userId: string) {
  const p = await prisma.parcours.findUnique({
    where: { id: parcoursId },
    select: { teacherId: true },
  });
  if (!p || p.teacherId !== userId) throw new Error("Non autorisé");
}

export async function getParcoursList() {
  const session = await getSession();
  return prisma.parcours.findMany({
    where: { teacherId: session.user.id },
    include: { _count: { select: { steps: true, classes: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createParcours(title: string) {
  if (!title.trim()) throw new Error("Titre requis");
  const session = await getSession();
  const p = await prisma.parcours.create({
    data: { title: title.trim(), teacherId: session.user.id },
  });
  revalidatePath("/create/parcours");
  return p;
}

export async function deleteParcours(id: string) {
  const session = await getSession();
  await assertParcoursOwner(id, session.user.id);
  await prisma.parcours.delete({ where: { id } });
  revalidatePath("/create/parcours");
}

export async function getParcoursForEdit(id: string) {
  const session = await getSession();
  const p = await prisma.parcours.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: { order: "asc" },
        include: {
          lesson: { select: { id: true, title: true } },
          quiz: { select: { id: true, title: true } },
        },
      },
      classes: { select: { id: true } },
    },
  });
  if (!p || p.teacherId !== session.user.id) throw new Error("Non autorisé");
  return p;
}

export async function getTeacherResources() {
  const session = await getSession();
  const [lessons, quizzes, classes] = await Promise.all([
    prisma.lesson.findMany({
      where: { teacherId: session.user.id },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.quiz.findMany({
      where: { teacherId: session.user.id },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.classe.findMany({
      where: { teacherId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { lessons, quizzes, classes };
}

export async function saveParcoursEdit(
  id: string,
  data: {
    title: string;
    steps: { lessonId: string | null; quizId: string | null }[];
    classIds: string[];
  },
) {
  const session = await getSession();
  await assertParcoursOwner(id, session.user.id);
  if (!data.title.trim()) throw new Error("Titre requis");

  await prisma.$transaction(async (tx) => {
    await tx.parcoursStep.deleteMany({ where: { parcoursId: id } });
    await tx.parcours.update({
      where: { id },
      data: {
        title: data.title.trim(),
        classes: { set: data.classIds.map((cid) => ({ id: cid })) },
      },
    });
    if (data.steps.length > 0) {
      await tx.parcoursStep.createMany({
        data: data.steps.map((s, i) => ({
          parcoursId: id,
          order: i,
          lessonId: s.lessonId || null,
          quizId: s.quizId || null,
        })),
      });
    }
  });

  revalidatePath("/create/parcours");
  revalidatePath(`/create/parcours/${id}`);
}

export async function markLessonDone(stepId: string) {
  const session = await getSession();

  const step = await prisma.parcoursStep.findUnique({
    where: { id: stepId },
    include: {
      parcours: {
        include: {
          classes: { include: { students: { select: { id: true } } } },
        },
      },
    },
  });

  if (!step) throw new Error("Étape introuvable");

  const hasAccess = step.parcours.classes.some((c) =>
    c.students.some((s) => s.id === session.user.id),
  );
  if (!hasAccess) throw new Error("Accès refusé");

  await prisma.stepCompletion.upsert({
    where: { userId_stepId: { userId: session.user.id, stepId } },
    update: { lessonDone: true },
    create: { userId: session.user.id, stepId, lessonDone: true },
  });

  revalidatePath(`/dashboard/parcours/${step.parcoursId}`);
}

export async function getParcoursForStudent(parcoursId: string) {
  const session = await getSession();

  const parcours = await prisma.parcours.findUnique({
    where: { id: parcoursId },
    include: {
      teacher: { select: { name: true } },
      classes: { include: { students: { select: { id: true } } } },
      steps: {
        orderBy: { order: "asc" },
        include: {
          lesson: { select: { id: true, title: true, image: true } },
          quiz: {
            select: {
              id: true,
              title: true,
              image: true,
              _count: { select: { questions: true } },
            },
          },
          completions: {
            where: { userId: session.user.id },
            select: { lessonDone: true },
          },
        },
      },
    },
  });

  if (!parcours) throw new Error("Parcours introuvable");

  const isTeacher = parcours.teacherId === session.user.id;
  const isStudent = parcours.classes.some((c) =>
    c.students.some((s) => s.id === session.user.id),
  );
  if (!isTeacher && !isStudent) throw new Error("Accès refusé");

  const quizIds = parcours.steps
    .filter((s) => s.quizId)
    .map((s) => s.quizId as string);

  const quizResults =
    quizIds.length > 0
      ? await prisma.result.findMany({
          where: { quizId: { in: quizIds }, userId: session.user.id },
          select: { quizId: true, score: true, total: true, id: true },
          orderBy: { createdAt: "desc" },
        })
      : [];

  const bestResult: Record<string, { id: string; score: number; total: number }> = {};
  for (const r of quizResults) {
    if (!bestResult[r.quizId]) bestResult[r.quizId] = r;
  }

  const steps = parcours.steps.map((step) => {
    const lessonDone = !step.lesson || (step.completions[0]?.lessonDone ?? false);
    const quizResult = step.quizId ? (bestResult[step.quizId] ?? null) : null;
    const quizDone = !step.quiz || quizResult !== null;
    return {
      id: step.id,
      order: step.order,
      lesson: step.lesson,
      quiz: step.quiz,
      lessonDone,
      quizResult,
      quizDone,
      stepDone: lessonDone && quizDone,
    };
  });

  const stepsWithUnlock = steps.map((step, i) => ({
    ...step,
    unlocked: i === 0 || steps[i - 1].stepDone,
  }));

  return {
    id: parcours.id,
    title: parcours.title,
    image: parcours.image,
    teacherName: parcours.teacher.name,
    steps: stepsWithUnlock,
    totalSteps: steps.length,
    completedSteps: steps.filter((s) => s.stepDone).length,
  };
}

export async function getStudentParcours(classIds: string[]) {
  if (classIds.length === 0) return [];
  return prisma.parcours.findMany({
    where: { classes: { some: { id: { in: classIds } } } },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { steps: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getStudentCompletedLessons() {
  const session = await getSession();

  const completions = await prisma.stepCompletion.findMany({
    where: {
      userId: session.user.id,
      lessonDone: true,
      step: { lessonId: { not: null } },
    },
    include: {
      step: {
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              image: true,
              teacherName: true,
              updatedAt: true,
            },
          },
          parcours: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const seen = new Set<string>();
  return completions
    .filter((c) => {
      if (!c.step.lesson || seen.has(c.step.lesson.id)) return false;
      seen.add(c.step.lesson.id);
      return true;
    })
    .map((c) => ({ ...c.step.lesson!, parcours: c.step.parcours }));
}

export async function getStudentCompletedQuizzes() {
  const session = await getSession();

  const results = await prisma.result.findMany({
    where: { userId: session.user.id },
    include: {
      quiz: { select: { id: true, title: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.quizId)) return false;
    seen.add(r.quizId);
    return true;
  });
}

export async function getStudentDirectLessons() {
  const session = await getSession();

  return prisma.lesson.findMany({
    where: {
      classes: { some: { students: { some: { id: session.user.id } } } },
    },
    select: { id: true, title: true, image: true, teacherName: true, updatedAt: true },
    orderBy: { title: "asc" },
  });
}

export async function getStudentDirectQuizzes() {
  const session = await getSession();

  const quizzes = await prisma.quiz.findMany({
    where: {
      classes: { some: { students: { some: { id: session.user.id } } } },
    },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { questions: true } },
      results: {
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, score: true, total: true },
      },
    },
    orderBy: { title: "asc" },
  });

  return quizzes.map((q) => ({ ...q, bestResult: q.results[0] ?? null }));
}
