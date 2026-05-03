"use client";

import { useSession } from "@/src/lib/auth-client";
import { unauthorized, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import DropMenu from "../../_components/DropMenu";
import { Button } from "@/components/ui/button";
import { createQuiz, getQuizzes } from "@/src/lib/actions/quiz-action";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, HelpCircle, Plus, Trash2, UploadCloud, X } from "lucide-react";
import { updateQuizImage, deleteQuiz } from "@/src/lib/actions/quiz-action";

interface Quiz {
  id: string;
  title: string;
  image: string | null;
  description: string | null;
  questions: { id: string }[];
  classes: { id: string }[];
}

export default function CreateQuizzPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteQuiz(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      toast.success("Quiz supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      const data = await getQuizzes();
      setQuizzes(data as Quiz[]);
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading ...</p>
      </div>
    );
  }

  if (!session?.user) return null;
  if (session.user.role !== "teacher") return unauthorized();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image trop lourde (max 2Mo)");
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const quiz = await createQuiz({ title });
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        await updateQuizImage(quiz.id, formData);
      }
      toast.success("Quiz créé !");
      router.push(`/create/quizz/${quiz.id}`);
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Mes Quiz
          </h1>
          <p className="text-muted-foreground font-medium">
            Créez et gérez vos quiz interactifs.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95 gap-2 px-6 rounded-full font-semibold cursor-pointer">
                <Plus className="w-5 h-5" /> Créer un quiz
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-none shadow-2xl gap-1">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-bold text-slate-800">
                  Nouveau quiz
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500">
                  Donnez un titre à votre quiz. Vous ajouterez les questions
                  ensuite.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <form className="py-4 flex flex-col gap-4" onSubmit={handleCreate}>
                <div className="space-y-2">
                  <Label htmlFor="quiz-title" className="text-sm font-bold text-slate-700">
                    Titre du quiz
                  </Label>
                  <Input
                    id="quiz-title"
                    placeholder="ex: Les bases de Python, Histoire de France..."
                    className="h-12 border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl transition-all"
                    required
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">
                    Image de couverture (optionnel)
                  </Label>
                  <input
                    type="file"
                    accept="image/*"
                    id="create-quiz-image"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <Label
                    htmlFor="create-quiz-image"
                    className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer overflow-hidden group"
                  >
                    {imagePreview ? (
                      <>

                        <img
                          src={imagePreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-bold bg-black/40 px-3 py-1 rounded-full">
                            Changer l&apos;image
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400">
                        <UploadCloud className="w-8 h-8" />
                        <p className="text-xs font-semibold">
                          Cliquez ou glissez une image
                        </p>
                        <p className="text-[11px]">PNG, JPG, WebP — max 2Mo</p>
                      </div>
                    )}
                  </Label>
                </div>
              </form>

              <AlertDialogFooter className="sm:gap-3">
                <AlertDialogCancel className="rounded-xl border-slate-200 font-medium cursor-pointer">
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isSubmitting}
                  onClick={handleCreate}
                  className="bg-indigo-600! hover:bg-indigo-700! text-white rounded-xl px-8 font-bold transition-all cursor-pointer"
                >
                  {isSubmitting ? "Création..." : "Créer"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DropMenu
            user={{
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              role: session.user.role,
            }}
          />
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <HelpCircle className="w-16 h-16 text-indigo-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-600 mb-2">
            Aucun quiz pour l&apos;instant
          </h2>
          <p className="text-slate-400 text-sm">
            Créez votre premier quiz en cliquant sur le bouton ci-dessus.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4">
          {quizzes.map((item) => (
            <Card
              key={item.id}
              className="group relative flex flex-col overflow-hidden border-none shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 rounded-3xl bg-white"
            >
              <div className="relative h-44 overflow-hidden rounded-t-3xl bg-indigo-50">
                <Image
                  src={item.image && item.image !== "" ? item.image : "/quiz.png"}
                  alt="Illustration Quiz"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {item.questions.length} question
                  {item.questions.length !== 1 ? "s" : ""}
                </div>
              </div>

              <CardHeader className="p-5">
                <div className="space-y-2">
                  <CardTitle className="text-xl font-extrabold text-slate-800 line-clamp-1">
                    {item.title}
                  </CardTitle>
                  {item.description && (
                    <CardDescription className="text-sm text-slate-500 line-clamp-2">
                      {item.description}
                    </CardDescription>
                  )}
                  {item.classes.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item.classes.length} classe
                      {item.classes.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 mt-auto flex flex-col gap-2">
                <Link href={`/create/quizz/${item.id}`} className="block">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 border-none shadow-none font-bold py-6 rounded-2xl transition-all flex items-center justify-between px-6 group/btn cursor-pointer">
                    Modifier le quiz
                    <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={deleting === item.id}
                      className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl py-2 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" /> Supprimer
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce quiz ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Le quiz et tous ses résultats seront supprimés.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500! hover:bg-red-600! cursor-pointer"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
