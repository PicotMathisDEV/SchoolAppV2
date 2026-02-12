"use server";

import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

export type UpdateUserResult = {
  success: boolean;
  message: string;
} | null;

export async function updateUserData(
  _prevState: UpdateUserResult,
  formData: FormData,
): Promise<UpdateUserResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return { success: false, message: "Non autorisé" };
    }

    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const imageFile = formData.get("image") as File | null;

    let imageUrl: string | undefined;

    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "avatars");

      const ext = imageFile.type.split("/")[1] ?? "png";
      const fileName = `avatar-${session.user.id}-${Date.now()}.${ext}`;
      const uploadPath = path.join(uploadDir, fileName);

      await writeFile(uploadPath, buffer);
      imageUrl = `/avatars/${fileName}`;
    }

    const updateData: any = {};
    if (name && name.trim() !== "") updateData.name = name;
    if (email && email.trim() !== "") updateData.email = email;
    if (imageUrl) updateData.image = imageUrl;

    if (Object.keys(updateData).length === 0) {
      return { success: false, message: "Aucune donnée modifiée" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, message: "Profil mis à jour avec succès" };
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour",
    };
  }
}
