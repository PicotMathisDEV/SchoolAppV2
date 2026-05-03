"use server";

import prisma from "@/src/lib/prisma";
import { auth } from "../auth";
import { headers } from "next/headers";

export async function getClasses() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Non autorisé");

  return await prisma.classe.findMany({
    where: {
      teacherId: session.user.id,
    },
    include: {
      students: { select: { id: true } },
      lessons: { select: { id: true } },
      quizzes: { select: { id: true } },
      parcours: { select: { id: true } },
    },
  });
}

export async function getMyClass() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Non autorisé");

  return await prisma.classe.findFirst({
    where: { students: { some: { id: session.user.id } } },
    select: {
      id: true,
      name: true,
      teacher: { select: { name: true } },
      students: { select: { id: true, name: true, email: true, image: true } },
      lessons: { select: { id: true, title: true, image: true, teacherName: true } },
      quizzes: {
        select: {
          id: true,
          title: true,
          image: true,
          description: true,
          _count: { select: { questions: true } },
        },
      },
    },
  });
}
