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
import { Textarea } from "@/components/ui/textarea";
import { getClasses } from "@/src/lib/actions/get-classes";
import {
  deleteQuiz,
  updateQuizClasses,
  updateQuizImage,
  updateQuizMeta,
} from "@/src/lib/actions/quiz-action";
import {
  ImageIcon,
  Loader2,
  Menu,
  Pencil,
  Share2,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

type Classe = {
  id: string;
  name: string;
  students: { id: string }[];
};

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  classes: { id: string }[];
};

type Props = {
  quiz: Quiz;
};

export const QuizDropSettings = ({ quiz }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [allClasses, setAllClasses] = useState<Classe[]>([]);
  const [checked, setChecked] = useState<string[]>(
    quiz.classes.map((c) => c.id),
  );

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses();
        setAllClasses(data as Classe[]);
      } catch {
        console.error("Impossible de charger les classes");
      }
    };
    fetchClasses();
  }, []);

  const handleUpdateMeta = () => {
    if (!title.trim()) return toast.error("Titre requis");
    startTransition(async () => {
      const res = await updateQuizMeta(quiz.id, { title, description });
      if (res) {
        toast.success("Quiz mis à jour");
        router.refresh();
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    });
  };

  const handleUpdateImage = () => {
    if (!imageFile) return toast.error("Image requise");
    const formData = new FormData();
    formData.append("image", imageFile);
    startTransition(async () => {
      const result = await updateQuizImage(quiz.id, formData);
      if (result.success) {
        toast.success("Image mise à jour");
        router.refresh();
      } else {
        toast.error("Erreur image");
      }
    });
  };

  const handleUpdateClasses = () => {
    startTransition(async () => {
      const res = await updateQuizClasses(quiz.id, checked);
      if (res.success) {
        toast.success("Classes mises à jour");
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteQuiz(quiz.id);
      toast.success("Quiz supprimé");
      router.push("/create/quizz");
    });
  };

  return (
    <div className="absolute top-6 left-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <Menu className="cursor-pointer hover:opacity-70 transition" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel>Paramètres du quiz</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Modifier titre /
                  description
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Modifier le quiz</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="flex flex-col gap-3 py-2">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">Titre</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Titre du quiz"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">
                      Description (optionnel)
                    </Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description du quiz"
                      className="resize-none h-20"
                      maxLength={500}
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUpdateMeta}
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer"
                >
                  <ImageIcon className="mr-2 h-4 w-4" /> Changer l&apos;image
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Nouvelle image de couverture</AlertDialogTitle>
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
                    {isPending ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Enregistrer"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Partager aux classes
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Classes autorisées</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sélectionnez les classes qui peuvent voir ce quiz.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-60 overflow-y-auto space-y-2 py-2">
                  {allClasses.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Aucune classe disponible
                    </p>
                  ) : (
                    allClasses.map((classe) => (
                      <div
                        key={classe.id}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`class-${classe.id}`}
                            checked={checked.includes(classe.id)}
                            onCheckedChange={(val) => {
                              setChecked((prev) =>
                                val
                                  ? [...prev, classe.id]
                                  : prev.filter((id) => id !== classe.id),
                              );
                            }}
                          />
                          <Label
                            htmlFor={`class-${classe.id}`}
                            className="cursor-pointer font-medium"
                          >
                            {classe.name}
                          </Label>
                        </div>
                        <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                          {classe.students.length} élève
                          {classe.students.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUpdateClasses}
                    disabled={isPending}
                    className="bg-indigo-600! hover:bg-indigo-700! cursor-pointer"
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

            <DropdownMenuSeparator />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-red-600 focus:text-red-600 cursor-pointer font-semibold"
                >
                  <Trash2 className="mr-2 h-4 w-4 text-red-500" /> Supprimer le
                  quiz
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la suppression ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes les questions et
                    réponses seront supprimées.
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

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push("/create/quizz")}
            className="cursor-pointer"
          >
            <HelpCircle className="mr-2 h-4 w-4" /> Retour à mes quiz
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
