"use client";

import { useCallback, useEffect, useState } from "react";
import DropMenu from "../_components/DropMenu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createClassAction } from "@/src/lib/actions/action";
import { toast } from "sonner";
import { unauthorized } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { getClasses } from "@/src/lib/actions/get-classes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { ArrowRight, BookOpen, HelpCircle, ListOrdered, Plus } from "lucide-react";
import GuidePopup from "../_components/GuidePopup";

interface Classe {
  id: string;
  name: string;
  students: { id: string }[];
  lessons: { id: string }[];
  quizzes: { id: string }[];
  parcours: { id: string }[];
}

export default function Page() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [nameValue, setNameValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { data: session, isPending } = useSession();

  const refetch = useCallback(async () => {
    const data = await getClasses();
    setClasses(data as Classe[]);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading ...</p>
      </div>
    );
  }

  if (session?.user.role !== "teacher") return unauthorized();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValue.trim()) return;
    setIsSubmitting(true);
    try {
      await createClassAction(nameValue, session.user.id, session.user.name);
      setNameValue("");
      toast.success("Classe créée !");
      await refetch();
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <GuidePopup role="teacher" userId={session.user.id} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Mes Classes
          </h1>
          <p className="text-muted-foreground font-medium">
            Gérez vos classes et suivez vos élèves.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95 gap-2 px-6 rounded-full font-semibold cursor-pointer">
                <Plus className="w-5 h-5" /> Créer une classe
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-none shadow-2xl gap-1">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-bold text-slate-800">
                  Nouvelle classe
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500">
                  Indiquez le nom de la classe (ex: T01, Terminale S).
                </AlertDialogDescription>
              </AlertDialogHeader>

              <form className="py-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold text-slate-700">
                    Nom de la classe
                  </Label>
                  <Input
                    id="name"
                    placeholder="ex: T01"
                    className="h-12 border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all"
                    required
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                  />
                </div>
              </form>

              <AlertDialogFooter className="sm:gap-3">
                <AlertDialogCancel className="rounded-xl border-slate-200 font-medium cursor-pointer">
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isSubmitting}
                  onClick={handleSubmit}
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
        {classes.map((item) => (
          <Card
            key={item.id}
            className="group relative flex flex-col overflow-hidden border-none shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 rounded-3xl bg-white"
          >
            <div className="relative h-44 overflow-hidden rounded-t-3xl">
              <Image
                src="/classes.png"
                alt="Illustration Classe"
                fill
                priority
                className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            </div>

            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-xl font-extrabold text-slate-800 line-clamp-1">
                Classe {item.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 font-medium">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-bold text-slate-500">
                  {item.students.length} élève{item.students.length !== 1 ? "s" : ""}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-2 flex flex-col gap-3">

              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  <BookOpen className="w-3 h-3" />
                  {item.lessons.length} leçon{item.lessons.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  <HelpCircle className="w-3 h-3" />
                  {item.quizzes.length} quiz
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                  <ListOrdered className="w-3 h-3" />
                  {item.parcours.length} parcours
                </span>
              </div>

              <Link href={`/gestion/${item.id}`} className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none shadow-none font-bold py-6 rounded-2xl transition-all flex items-center justify-between px-6 group/btn cursor-pointer">
                  Gérer la classe
                  <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
