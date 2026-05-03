"use client";

import { useEffect, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateUserData } from "@/src/lib/actions/update-user";
import { clearStudentPassword } from "@/src/lib/actions/action";
import Image from "next/image";
import { authClient } from "@/src/lib/auth-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  user: {
    name: string | null;
    email: string | null;
    image: string | null | undefined;
  };
};

const EditSettings = ({ user }: Props) => {
  const router = useRouter();
  const [state, action, isPending] = useActionState(updateUserData, null);

  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {

    }
  };

  const handleChangePassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Veuillez remplir les deux champs de mot de passe");
      return;
    }

    setIsChangingPassword(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      toast.error(error.message || "Erreur lors du changement de mot de passe");
    } else {
      toast.success("Mot de passe mis à jour avec succès");
      setCurrentPassword("");
      setNewPassword("");
      // Clear the temporary password stored by the teacher
      await clearStudentPassword().catch(() => {});
    }
    setIsChangingPassword(false);
  };

  const confirmDelete = async (e: React.MouseEvent) => {
    if (!deletePassword) {
      e.preventDefault();
      toast.error("Le mot de passe est requis");
      return;
    }

    setIsDeleting(true);
    const { error } = await authClient.deleteUser({
      password: deletePassword,
    });

    if (error) {
      toast.error(error.message || "Erreur lors de la suppression");
      setIsDeleting(false);
    } else {
      toast.success("Compte supprimé définitivement");
      router.push("/goodbye");
    }
  };

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.message);
      window.location.reload();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="max-w-2xl mx-auto py-16 px-6 relative">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">
          Paramètres du compte
        </h1>
        <p className="text-muted-foreground text-sm">
          Gérez vos informations personnelles et votre sécurité.
        </p>
      </div>

      <form action={action} className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted border border-border">
              <Image
                fill
                src={user.image || "/user.svg"}
                alt="Avatar"
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="image" className="text-base">
                Photo de profil
              </Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="max-w-xs cursor-pointer bg-background"
              />
            </div>
          </div>

          <div className="grid gap-8">
            <div className="grid gap-2">
              <Label htmlFor="name">Nouveau nom</Label>
              <Input
                id="name"
                name="name"
                placeholder={user.name || "Votre nom"}
                className="max-w-md"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Nouvel email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={user.email || "votre@email.com"}
                className="max-w-md"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="px-8 cursor-pointer bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "Enregistrement..." : "Sauvegarder les informations"}
          </Button>
        </section>
      </form>

      <section className="mt-12 pt-12 border-t border-muted/40 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Sécurité</h2>
          <p className="text-sm text-muted-foreground">
            Mettez à jour votre mot de passe pour sécuriser votre compte.
          </p>
        </div>

        <div className="grid gap-4 max-w-md">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Mot de passe actuel</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button
            variant="default"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="w-fit cursor-pointer bg-blue-600 hover:bg-blue-700"
          >
            {isChangingPassword ? "Mise à jour..." : "Changer le mot de passe"}
          </Button>
        </div>
      </section>

      <section className="mt-12 pt-12 border-t border-destructive/20">
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive">Attention</h2>
          <p className="text-sm text-muted-foreground mb-4">
            La suppression de votre compte est définitive et effacera toutes vos
            données.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="cursor-pointer"
              >
                Supprimer mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">
                  Supprimer le compte
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Veuillez saisir votre mot de
                  passe pour confirmer la suppression définitive.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-2">
                <Label htmlFor="delete-password">Mot de passe</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setDeletePassword("")}
                  className="cursor-pointer"
                >
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-destructive! text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                >
                  {isDeleting ? "Suppression..." : "Confirmer la suppression"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
};

export default EditSettings;
