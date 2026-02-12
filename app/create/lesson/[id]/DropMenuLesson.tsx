"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getClasses } from "@/src/lib/actions/get-classes";
import {
  deleteLesson,
  updateLessonClasses,
  updateLessonImage,
  updateLessonName,
} from "@/src/lib/actions/lesson-action";

import { ImageIcon, Menu, Pencil, Share2, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

/* -------------------------- */
/* TYPES            */
/* -------------------------- */

type Classe = {
  id: string;
  name: string;
};

type Lesson = {
  id: string;
  name: string;
  image?: string;
  classes?: { id: string }[];
};

type Props = {
  lesson: Lesson;
};

/* -------------------------- */
/* COMPONENT          */
/* -------------------------- */

export const DropMenuLesson = ({ lesson }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // États du formulaire
  const [title, setTitle] = useState(lesson.name);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [allClasses, setAllClasses] = useState<Classe[]>([]);
  const [checked, setChecked] = useState<string[]>([]);

  // Initialisation des données
  useEffect(() => {
    if (lesson.classes) {
      setChecked(lesson.classes.map((c) => c.id));
    }

    const fetchClasses = async () => {
      try {
        const data = await getClasses();
        setAllClasses(data);
      } catch (error) {
        console.error("Failed to fetch classes", error);
      }
    };
    fetchClasses();
  }, [lesson]);

  /* -------------------------- */
  /* ACTIONS           */
  /* -------------------------- */

  const handleUpdateTitle = () => {
    if (!title.trim()) return toast.error("Titre requis");
    startTransition(async () => {
      const res = await updateLessonName(lesson.id, title);
      if (res?.success !== false) {
        toast.success("Titre mis à jour");
        router.refresh();
      } else toast.error("Erreur lors de la mise à jour");
    });
  };

  const handleUpdateImage = () => {
    if (!imageFile) return toast.error("Image requise");
    const formData = new FormData();
    formData.append("image", imageFile);

    startTransition(async () => {
      const result = await updateLessonImage(lesson.id, formData);
      if (result.success) {
        toast.success("Image mise à jour");
        router.refresh();
      } else toast.error("Erreur image");
    });
  };

  const handleUpdateClasses = () => {
    startTransition(async () => {
      const res = await updateLessonClasses(lesson.id, checked);
      if (res.success) {
        toast.success("Classes mises à jour");
        router.refresh();
        // Le useEffect ci-dessus s'occupera de recocher si nécessaire
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteLesson(lesson.id);
      toast.success("Supprimé");
      router.push("/create/lesson");
    });
  };

  return (
    <div className="absolute top-6 left-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <Menu className="cursor-pointer hover:opacity-70 transition" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Paramètres</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {/* MODIFIER TITRE */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 h-4 w-4" /> Modifier le titre
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Modifier le titre</AlertDialogTitle>
                </AlertDialogHeader>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nom de la leçon"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUpdateTitle}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Sauvegarder"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* MODIFIER IMAGE */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <ImageIcon className="mr-2 h-4 w-4" /> Changer l'image
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Nouvelle image</AlertDialogTitle>
                </AlertDialogHeader>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUpdateImage}
                    disabled={isPending}
                  >
                    Enregistrer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* GÉRER CLASSES */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Share2 className="mr-2 h-4 w-4" /> Partager / Classes
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Classes autorisées</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sélectionnez qui peut voir cette leçon.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-60 overflow-y-auto space-y-2 py-2">
                  {allClasses.map((classe) => (
                    <div
                      key={classe.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={classe.id}
                        checked={checked.includes(classe.id)}
                        onCheckedChange={(val) => {
                          setChecked((prev) =>
                            val
                              ? [...prev, classe.id]
                              : prev.filter((id) => id !== classe.id),
                          );
                        }}
                      />
                      <Label htmlFor={classe.id} className="cursor-pointer">
                        {classe.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUpdateClasses}
                    disabled={isPending}
                  >
                    Sauvegarder
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <DropdownMenuSeparator />

            {/* SUPPRIMER */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirmer la suppression ?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
