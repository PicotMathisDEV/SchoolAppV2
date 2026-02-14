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
import type { Editor } from "@tiptap/core";
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

import {
  ImageIcon,
  Menu,
  Pencil,
  Share2,
  Trash2,
  Loader2,
  Bookmark,
  Link,
  FileIcon,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Classe = {
  id: string;
  name: string;
  students: string[];
};

type Lesson = {
  id: string;
  title: string;
  teacherId: string;
  teacherName: string;
  content: string;
  image: string;
  classes: { id: string; name?: string }[];
};

type Props = {
  lesson: Lesson;
  editor: Editor | null; // Ajoute l'éditeur ici
};

export const Drop = ({ lesson, editor }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [allClasses, setAllClasses] = useState<Classe[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [InputValue, setInputValue] = useState(
    `/dashboard/join/lesson/${lesson.id}`,
  );

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
      }
    });
  };

  const handleUploadLocalFile = () => {
    if (!localFile) return toast.error("Veuillez sélectionner un fichier");

    // Vérification de l'extension
    if (!localFile.name.endsWith(".docx")) {
      return toast.error("Seuls les fichiers .docx sont acceptés");
    }

    if (!editor) {
      return toast.error("L'éditeur n'est pas prêt");
    }

    try {
      // 1. On lance la commande d'importation de Tiptap Pro
      editor.chain().focus().importDocx({ file: localFile }).run();
      toast.success(`Document ${localFile.name} importé !`);
      setLocalFile(null); // Reset le fichier après l'import
    } catch (error) {
      console.error("Erreur import DOCX:", error);
      toast.error("Erreur lors de la conversion du document");
    }
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteLesson(lesson.id);
      toast.success("Supprimé");
      router.push("/create/lesson");
    });
  };
  console.log(allClasses);
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Modifier le titre
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Modifier le titre</AlertDialogTitle>
                </AlertDialogHeader>
                <Input
                  value={lesson.title}
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer"
                >
                  <ImageIcon className="mr-2 h-4 w-4 " /> Changer l&apos;image
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer"
                >
                  <Upload className="mr-2 h-4 w-4" /> Fichier local
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-red-500" />
                    Local File
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Choisissez un document depuis votre ordinateur pour
                    l&apos;ajouter à la leçon.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors">
                  <Input
                    id="local-file"
                    type="file"
                    className="hidden"
                    onChange={(e) => setLocalFile(e.target.files?.[0] || null)}
                  />
                  <Label
                    htmlFor="local-file"
                    className="cursor-pointer flex flex-col items-center gap-2 w-full"
                  >
                    <div className="bg-red-50 p-3 rounded-full">
                      <FileIcon className="h-8 w-8 text-red-600" />
                    </div>
                    <span className="text-sm font-medium">
                      {localFile
                        ? localFile.name
                        : "Cliquez pour choisir un fichier"}
                    </span>
                  </Label>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setLocalFile(null)}>
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUploadLocalFile}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Insérer le fichier
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
                  <Share2 className="mr-2 h-4 w-4 cursor-pointer" /> Partager a
                  mes classes
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
                      className="flex items-center justify-between space-x-2 p-1 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      <div className="flex items-center space-x-2">
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
                        <Label
                          htmlFor={classe.id}
                          className="cursor-pointer font-medium"
                        >
                          {classe.name}
                        </Label>
                      </div>

                      <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                        {classe.students.length} eleves
                      </span>
                    </div>
                  ))}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUpdateClasses}
                    disabled={isPending}
                    className="bg-blue-600! hover:bg-blue-700! cursor-pointer"
                  >
                    Sauvegarder
                  </AlertDialogAction>
                </AlertDialogFooter>
                <div
                  className="flex gap-3 items-center
                "
                >
                  <Button
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700!"
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(InputValue);
                        toast.success(
                          "Lien de la lecon copié dans le presse papier",
                        );
                      } catch (err) {
                        throw err;
                      }
                    }}
                  >
                    <Link />
                  </Button>
                  <Input
                    id={lesson.id}
                    type="text"
                    className="max-w-sm"
                    value={InputValue}
                    readOnly
                  ></Input>
                </div>
              </AlertDialogContent>
            </AlertDialog>

            <DropdownMenuSeparator />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-red-600 focus:text-red-600 cursor-pointer font-semibold "
                >
                  <Trash2 className="mr-2 h-4 w-4 text-red-500" /> Supprimer
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push("/create/lesson")}
            className="cursor-pointer"
          >
            <Bookmark /> Retour a mes lecons
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
