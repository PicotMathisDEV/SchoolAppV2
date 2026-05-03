"use client";

import { useSession } from "@/src/lib/auth-client";
import { unauthorized, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DropMenu from "../../_components/DropMenu";
import { Button } from "@/components/ui/button";
import { createLesson, getLessons, deleteLesson } from "@/src/lib/actions/lesson-action";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Plus, Trash2 } from "lucide-react";

type Lesson = Awaited<ReturnType<typeof getLessons>>[number];

export default function CreateLessonPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) getLessons().then(setLessons).catch(() => {});
  }, [session]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Chargement…</p>
      </div>
    );
  }

  if (!session?.user) return null;
  if (session.user.role !== "teacher") return unauthorized();

  const handleCreate = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const lesson = await createLesson(title, "", session.user.id, session.user.name);
      toast.success("Leçon créée !");
      router.push(`/create/lesson/${lesson.id}`);
    } catch {
      toast.error("Erreur lors de la création");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteLesson(id);
      setLessons((prev) => prev.filter((l) => l.id !== id));
      toast.success("Leçon supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mes Leçons</h1>
          <p className="text-muted-foreground font-medium">Créez et gérez vos leçons.</p>
        </div>

        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95 gap-2 px-6 rounded-full font-semibold cursor-pointer">
                <Plus className="w-5 h-5" /> Créer une leçon
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-none shadow-2xl gap-1">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-bold text-slate-800">
                  Nouvelle leçon
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500">
                  Précisez le titre de votre leçon. Vous pourrez ajouter le contenu ensuite.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form className="py-6" onSubmit={handleCreate}>
                <div className="space-y-2">
                  <Label htmlFor="lesson-title" className="text-sm font-bold text-slate-700">
                    Titre de la leçon
                  </Label>
                  <Input
                    id="lesson-title"
                    placeholder="ex: Facteurs de Fresnel, Trigonométrie…"
                    className="h-12 border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate(e)}
                    autoFocus
                  />
                </div>
              </form>
              <AlertDialogFooter className="sm:gap-3">
                <AlertDialogCancel className="rounded-xl border-slate-200 font-medium cursor-pointer">
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isSubmitting || !title.trim()}
                  onClick={handleCreate}
                  className="bg-blue-600! hover:bg-blue-700! text-white rounded-xl px-8 font-bold transition-all cursor-pointer"
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

      {lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="w-16 h-16 text-blue-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-600 mb-2">Aucune leçon pour l&apos;instant</h2>
          <p className="text-slate-400 text-sm">
            Créez votre première leçon en cliquant sur le bouton ci-dessus.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4">
          {lessons.map((item) => (
            <Card
              key={item.id}
              className="group relative flex flex-col overflow-hidden border-none shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 rounded-3xl bg-white"
            >
              <div className="relative h-44 overflow-hidden rounded-t-3xl bg-blue-50">
                <Image
                  src={item.image && item.image !== "" ? item.image : "/lesson.png"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              </div>

              <CardHeader className="p-5">
                <CardTitle className="text-xl font-extrabold text-slate-800 line-clamp-1">
                  {item.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-slate-500">Par {item.teacherName}</span>
                </CardDescription>
                {item.classes.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mt-1">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {item.classes.length} classe{item.classes.length !== 1 ? "s" : ""}
                  </span>
                )}
              </CardHeader>

              <CardContent className="p-5 pt-0 mt-auto flex flex-col gap-2">
                <Link href={`/create/lesson/${item.id}`} className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 border-none shadow-none font-bold py-6 rounded-2xl transition-all flex items-center justify-between px-6 group/btn cursor-pointer">
                    Modifier le contenu
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
                      <AlertDialogTitle>Supprimer cette leçon ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. La leçon sera supprimée définitivement.
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
