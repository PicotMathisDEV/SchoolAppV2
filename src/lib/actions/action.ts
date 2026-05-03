"use server";

import prisma from "@/src/lib/prisma";
import { auth, teacherCreatedEmails } from "../auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");
  return session;
}

async function assertClassOwner(classeId: string, userId: string) {
  const classe = await prisma.classe.findUnique({
    where: { id: classeId },
    select: { teacherId: true },
  });
  if (!classe || classe.teacherId !== userId) throw new Error("Non autorisé");
  return classe;
}

export async function createClassAction(
  name: string,
  teacherId: string,
  teacherName: string,
) {
  if (!name?.trim()) throw new Error("Nom requis");

  await prisma.classe.create({
    data: { name: name.trim(), teacherId, teacherName },
  });
}

export async function createStudentAndAssignToClass(
  email: string,
  password: string,
  name: string,
  classeId: string,
) {
  if (!password || !name || !email || !classeId) throw new Error("Tous les champs sont requis");

  const session = await getSession();
  await assertClassOwner(classeId, session.user.id);

  // Flag this email so sendVerificationEmail skips it — the student will get
  // the email when they first try to log in (sendOnSignIn: true).
  teacherCreatedEmails.add(email);

  const result = await auth.api.signUpEmail({
    body: { email, password, name },
    headers: new Headers(),
  });

  if (!result?.user) {
    teacherCreatedEmails.delete(email);
    throw new Error("Erreur lors de la création du compte élève");
  }

  // Set role and store temporary plaintext password — do NOT set emailVerified: true
  // so BetterAuth sends the verification email at first login attempt.
  await prisma.user.update({
    where: { id: result.user.id },
    data: { role: "student", password },
  });

  await prisma.classe.update({
    where: { id: classeId },
    data: { students: { connect: { id: result.user.id } } },
  });

  revalidatePath("/gestion");
  return result.user;
}

export async function getOneClass(id: string) {
  const session = await getSession();
  await assertClassOwner(id, session.user.id);

  return await prisma.classe.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      inviteCode: true,
      students: { select: { id: true, name: true, email: true, image: true, password: true } },
      lessons: { select: { id: true, title: true, image: true } },
      quizzes: {
        select: {
          id: true,
          title: true,
          image: true,
          _count: { select: { questions: true } },
        },
      },
      parcours: {
        select: {
          id: true,
          title: true,
          image: true,
          _count: { select: { steps: true } },
        },
      },
    },
  });
}

export async function RemoveStudentFromClass(studentId: string, classeId: string) {
  const session = await getSession();
  await assertClassOwner(classeId, session.user.id);

  return await prisma.classe.update({
    where: { id: classeId },
    data: { students: { disconnect: { id: studentId } } },
  });
}

export async function RemoveClass(classeId: string) {
  const session = await getSession();
  await assertClassOwner(classeId, session.user.id);

  return await prisma.classe.delete({ where: { id: classeId } });
}

export async function clearStudentPassword() {
  const session = await getSession();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: null },
  });
}

export async function ModifyClassName(classeId: string, newName: string) {
  if (!newName?.trim()) throw new Error("Nom requis");

  const session = await getSession();
  await assertClassOwner(classeId, session.user.id);

  await prisma.classe.update({
    where: { id: classeId },
    data: { name: newName.trim() },
  });
}

export async function generateInviteCode(classeId: string) {
  const session = await getSession();
  await assertClassOwner(classeId, session.user.id);

  const code = Math.random().toString(36).slice(2, 8).toUpperCase();

  await prisma.classe.update({
    where: { id: classeId },
    data: { inviteCode: code },
  });

  revalidatePath(`/gestion/${classeId}`);
  return code;
}

export async function joinClassByCode(code: string) {
  const session = await getSession();

  const classe = await prisma.classe.findUnique({
    where: { inviteCode: code.trim().toUpperCase() },
    include: { students: { select: { id: true } } },
  });

  if (!classe) throw new Error("Code invalide");

  const alreadyIn = classe.students.some((s) => s.id === session.user.id);
  if (alreadyIn) throw new Error("Vous êtes déjà dans cette classe");

  if (session.user.id === classe.teacherId) throw new Error("Vous êtes le professeur de cette classe");

  await prisma.classe.update({
    where: { id: classe.id },
    data: { students: { connect: { id: session.user.id } } },
  });

  revalidatePath("/dashboard");
  return { classeId: classe.id, className: classe.name };
}
