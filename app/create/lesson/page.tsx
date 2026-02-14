"use client";

import { useSession } from "@/src/lib/auth-client";
import { unauthorized, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import DropMenu from "../../_components/DropMenu";
import { Button } from "@/components/ui/button";
import { createLesson, getLessons } from "@/src/lib/actions/lesson-action";
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
import { ArrowRight, Plus } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  teacherId: string;
  teacherName: string;
  content: string;
  image: string;
}

export default function CreateLessonPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [title, setTittle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lesson, setLesson] = useState<Lesson[]>([]);

  useEffect(() => {
    const fetchLessons = async () => {
      const data = await getLessons();
      setLesson(data);
    };

    fetchLessons();
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

  if (!session?.user) {
    return null;
  }
  if (session?.user.role != "teacher") {
    return unauthorized();
  }

  const handlesubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createLesson(title, content, session.user.id, session.user.name);
      setTittle("");
      setContent("");

      toast.success("Lesson créée !");
    } catch (err) {
      console.log(err);
      toast.error("Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
      router.push("/dashboard");
      router.push("/create/lesson");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Mes Leçons
          </h1>
          <p className="text-muted-foreground font-medium">
            Créez et gérez vos lecons.
          </p>
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
                  Précisez le titre de votre leçon. Vous pourrez ajouter le
                  contenu détaillé plus tard.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <form className="py-6" onSubmit={handlesubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-bold text-slate-700"
                    >
                      Titre de la leçon
                    </Label>
                    <Input
                      id="name"
                      placeholder="ex: Facteurs de Fresnel, Trigonométrie..."
                      className="h-12 border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all"
                      required
                      onChange={(e) => setTittle(e.target.value)}
                    />
                  </div>
                </div>
              </form>

              <AlertDialogFooter className="sm:gap-3">
                <AlertDialogCancel className="rounded-xl border-slate-200 font-medium cursor-pointer">
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isSubmitting}
                  onClick={handlesubmit}
                  className="bg-blue-600! hover:bg-blue-700! text-white rounded-xl px-8 font-bold transition-all cursor-pointer"
                >
                  {isSubmitting ? "Création..." : "Confirmer"}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4">
        {lesson.map((item) => (
          <Card
            key={item.id}
            className="group relative flex flex-col overflow-hidden border-none shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 rounded-3xl bg-white"
          >
            <div className="relative h-44 overflow-hidden rounded-t-lg">
              <Image
                src={item.image && item.image !== "" ? item.image : "/lesson"}
                alt="Illustration Leçon"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            </div>

            <CardHeader className="p-5">
              <div className="space-y-2">
                <CardTitle className="text-xl font-extrabold text-slate-800 line-clamp-1">
                  {item.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-slate-500">
                    {`Par ${item.teacherName}`}
                  </span>
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 mt-auto">
              <Link href={`/create/lesson/${item.id}`} className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-600   border-none shadow-none font-bold py-6 rounded-2xl transition-all flex items-center justify-between px-6 group/btn cursor-pointer">
                  Modifier le contenu
                  <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        {lesson.map((item) => (
          <div key={item.id}>
            <>
              <style
                dangerouslySetInnerHTML={{
                  __html: `
    .custom-content table { border-collapse: collapse; width: 100%; }
    .custom-content th, .custom-content td { border: 1px solid #ccc; padding: 8px; }
    .custom-content th { background: #eee; }
  `,
                }}
              />
              <div
                className="custom-content"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </>
          </div>
        ))}
      </div>
    </div>
  );
}
