"use client";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";

import {
  Bookmark,
  GraduationCapIcon,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Puzzle,
  Settings,
  ShieldUser,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "@/src/lib/auth-client";

type Props = {
  user: {
    name: string | null;
    email: string | null;
    image: string | null | undefined;
    role: string | null | undefined;
  };
};

const DropMenu = ({ user }: Props) => {
  const router = useRouter();

  const settings = () => router.push("/settings");
  const dashboard = () => router.push("/dashboard");
  const gestion = () => router.push("/gestion");

  const handleSignOut = async () => {
    await signOut();
    router.push("/dashboard");
    toast.success("Déconnecté");
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="absolute top-6 right-8">
          <Button className="flex flex-row items-center gap-2 p-2 bg-white text-black border border-black/20 hover:bg-white/80 cursor-pointer">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
              <Image
                src={user?.image ?? "/user.svg"}
                alt="Avatar"
                fill
                className="object-cover"
              />
            </div>
            <h2 className="font-semibold">{user?.name}</h2>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-semibold text-sm">
            Mon Compte
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer " onClick={dashboard}>
            <LayoutDashboard /> Dashboard
          </DropdownMenuItem>

          {user.role === "teacher" && <DropdownMenuSeparator />}
          {user?.role === "teacher" && (
            <DropdownMenuItem className="cursor-pointer" onClick={gestion}>
              <ShieldUser /> Gestion des classes
            </DropdownMenuItem>
          )}

          {user?.role === "teacher" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Puzzle className="h-4 w-4 font-normal text-gray-600" />
                  <span className="font-normal">Créer un module</span>
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="cursor-pointer ml-2"
                  onClick={() => router.push("/create/parcours")}
                >
                  <GraduationCapIcon className="mr-2 h-4 w-4" />
                  <span>Parcours</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer ml-2"
                  onClick={() => router.push("/create/lesson")}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>Lessons</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer ml-2"
                  onClick={() => router.push("/create/quizz")}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Quizz</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={settings}>
            <Settings /> Paramètres
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="text-red-500 font-semibold flex items-center gap-2 cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <LogOut className="h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent className="p-0 overflow-hidden border-none max-w-md">
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertDialogTitle className="text-lg font-semibold text-destructive">
                    Attention
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-sm text-muted-foreground mb-6">
                  Vous êtes sur le point de vous déconnecter. Vous devrez saisir
                  à nouveau vos identifiants pour accéder à votre espace.
                </AlertDialogDescription>

                <div className="flex justify-end gap-3">
                  <AlertDialogCancel className="mt-0 border-destructive/20 hover:bg-destructive/10 hover:text-destructive cursor-pointer">
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSignOut}
                    className="bg-red-500! text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                  >
                    Se déconnecter
                  </AlertDialogAction>
                </div>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DropMenu;
