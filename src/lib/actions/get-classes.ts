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
      students: true,
    },
  });
}
