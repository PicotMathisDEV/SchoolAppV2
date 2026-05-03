"use server";

import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { uploadImage } from "../storage";

export type UpdateUserResult = {
  success: boolean;
  message: string;
} | null;

export async function updateUserData(
  _prevState: UpdateUserResult,
  formData: FormData,
): Promise<UpdateUserResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, message: "Non autorisé" };

    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const imageFile = formData.get("image") as File | null;

    const updateData: Record<string, string> = {};
    if (name?.trim()) updateData.name = name.trim();
    if (email?.trim()) updateData.email = email.trim();

    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      updateData.image = await uploadImage(
        imageFile,
        "avatars",
        `avatar-${session.user.id}`,
      );
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, message: "Aucune donnée modifiée" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: { ...updateData, updatedAt: new Date() },
      });
      if (updateData.name) {
        await tx.classe.updateMany({
          where: { teacherId: session.user.id },
          data: { teacherName: updateData.name },
        });
        await tx.lesson.updateMany({
          where: { teacherId: session.user.id },
          data: { teacherName: updateData.name },
        });
      }
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, message: "Profil mis à jour avec succès" };
  } catch (error) {
    console.error("[settings] updateUserData:", error);
    return { success: false, message: "Une erreur est survenue lors de la mise à jour" };
  }
}
