"use server";

import prisma from "@/src/lib/prisma";
import { auth } from "../auth";
import { headers } from "next/headers";

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");
  return session;
}

/* ─── Fetch quiz for student (access check) ─────────────────────────────── */

export async function getQuizForStudent(quizId: string) {
  const session = await getSession();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: { options: true },
      },
      classes: {
        include: { students: { select: { id: true } } },
      },
    },
  });

  if (!quiz) throw new Error("Quiz introuvable");

  const isTeacher = quiz.teacherId === session.user.id;
  const isStudentViaClass = quiz.classes.some((c) =>
    c.students.some((s) => s.id === session.user.id),
  );

  let isStudentViaParcours = false;
  if (!isTeacher && !isStudentViaClass) {
    const step = await prisma.parcoursStep.findFirst({
      where: {
        quizId,
        parcours: {
          classes: { some: { students: { some: { id: session.user.id } } } },
        },
      },
    });
    isStudentViaParcours = !!step;
  }

  if (!isTeacher && !isStudentViaClass && !isStudentViaParcours)
    throw new Error("Accès refusé");

  // Don't expose which option is correct to the client
  return {
    id: quiz.id,
    title: quiz.title,
    image: quiz.image,
    description: quiz.description,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      content: q.content,
      image: q.image,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        image: o.image,
      })),
    })),
  };
}

/* ─── Submit attempt ─────────────────────────────────────────────────────── */

export async function submitQuizAttempt(
  quizId: string,
  answers: { questionId: string; selectedOptionId: string | null }[],
) {
  const session = await getSession();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: { include: { options: true } },
      classes: { include: { students: { select: { id: true } } } },
    },
  });

  if (!quiz) throw new Error("Quiz introuvable");

  const isTeacher = quiz.teacherId === session.user.id;
  const isStudentViaClass = quiz.classes.some((c) =>
    c.students.some((s) => s.id === session.user.id),
  );
  let isStudentViaParcours = false;
  if (!isTeacher && !isStudentViaClass) {
    const step = await prisma.parcoursStep.findFirst({
      where: {
        quizId,
        parcours: {
          classes: { some: { students: { some: { id: session.user.id } } } },
        },
      },
    });
    isStudentViaParcours = !!step;
  }
  if (!isTeacher && !isStudentViaClass && !isStudentViaParcours)
    throw new Error("Accès refusé");

  let score = 0;
  const answerDetails: {
    questionId: string;
    selectedOptionId: string | null;
    isCorrect: boolean;
  }[] = [];

  for (const question of quiz.questions) {
    const answer = answers.find((a) => a.questionId === question.id);
    const selectedOptionId = answer?.selectedOptionId ?? null;
    const selectedOption = selectedOptionId
      ? question.options.find((o) => o.id === selectedOptionId)
      : null;
    const isCorrect = selectedOption?.isCorrect ?? false;
    if (isCorrect) score++;
    answerDetails.push({ questionId: question.id, selectedOptionId, isCorrect });
  }

  try {
    const result = await prisma.result.create({
      data: {
        userId: session.user.id,
        quizId,
        score,
        total: quiz.questions.length,
        answers: {
          create: answerDetails.map((a) => ({
            questionId: a.questionId,
            ...(a.selectedOptionId ? { selectedOptionId: a.selectedOptionId } : {}),
            isCorrect: a.isCorrect,
          })),
        },
      },
    });
    return { resultId: result.id };
  } catch (error) {
    console.error("[submitQuizAttempt] Prisma error:", error);
    throw error;
  }
}

/* ─── Get a single result with full breakdown ────────────────────────────── */

export async function getQuizResult(resultId: string) {
  const session = await getSession();

  const result = await prisma.result.findUnique({
    where: { id: resultId },
    include: {
      quiz: { select: { id: true, title: true, image: true } },
      answers: {
        include: {
          question: { include: { options: true } },
          selectedOption: true,
        },
      },
    },
  });

  if (!result || result.userId !== session.user.id) throw new Error("Non autorisé");

  return result;
}

/* ─── Student dashboard data ─────────────────────────────────────────────── */

export async function getStudentDashboard() {
  const session = await getSession();

  const myClasses = await prisma.classe.findMany({
    where: { students: { some: { id: session.user.id } } },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { students: true } },
      lessons: { select: { id: true, title: true, image: true, teacherName: true } },
      quizzes: {
        select: {
          id: true,
          title: true,
          image: true,
          description: true,
          teacher: { select: { name: true } },
          _count: { select: { questions: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const classIds = myClasses.map((c) => c.id);

  const myParcours =
    classIds.length > 0
      ? await prisma.parcours.findMany({
          where: { classes: { some: { id: { in: classIds } } } },
          include: {
            teacher: { select: { name: true } },
            _count: { select: { steps: true } },
          },
          orderBy: { createdAt: "asc" },
        })
      : [];

  return { myClasses, myParcours };
}
