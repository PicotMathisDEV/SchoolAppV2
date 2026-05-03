"use client";

import { useSession } from "@/src/lib/auth-client";
import { unauthorized, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DropMenu from "../../_components/DropMenu";
import { Button } from "@/components/ui/button";
import { getParcoursList, createParcours, deleteParcours } from "@/src/lib/actions/parcours-action";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ListOrdered, Plus, Trash2 } from "lucide-react";

type Parcours = Awaited<ReturnType<typeof getParcoursList>>[number];

export default function CreateParcoursPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) getParcoursList().then(setParcoursList).catch(() => {});
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const p = await createParcours(newTitle);
      toast.success("Parcours créé !");
      router.push(`/create/parcours/${p.id}`);
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteParcours(id);
      setParcoursList((prev) => prev.filter((p) => p.id !== id));
      toast.success("Parcours supprimé");
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mes Parcours</h1>
          <p className="text-muted-foreground font-medium">
            Créez et gérez vos séquences de leçons et quiz.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95 gap-2 px-6 rounded-full font-semibold cursor-pointer">
                <Plus className="w-5 h-5" /> Créer un parcours
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-none shadow-2xl gap-1">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-bold text-slate-800">
                  Nouveau parcours
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500">
                  Donnez un titre à votre parcours. Vous ajouterez les étapes ensuite.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <form className="py-6" onSubmit={handleCreate}>
                <div className="space-y-2">
                  <Label htmlFor="parcours-title" className="text-sm font-bold text-slate-700">
                    Titre du parcours
                  </Label>
                  <Input
                    id="parcours-title"
                    placeholder="ex: Introduction à la programmation…"
                    className="h-12 border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
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
                  disabled={isSubmitting || !newTitle.trim()}
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

      {parcoursList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ListOrdered className="w-16 h-16 text-blue-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-600 mb-2">Aucun parcours pour l&apos;instant</h2>
          <p className="text-slate-400 text-sm">
            Créez votre premier parcours en cliquant sur le bouton ci-dessus.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4">
          {parcoursList.map((item) => (
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
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item._count.steps} étape{item._count.steps !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <CardHeader className="p-5">
                <CardTitle className="text-xl font-extrabold text-slate-800 line-clamp-1">
                  {item.title}
                </CardTitle>
                {item._count.classes > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mt-1">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {item._count.classes} classe{item._count.classes !== 1 ? "s" : ""}
                  </span>
                )}
              </CardHeader>

              <CardContent className="p-5 pt-0 mt-auto flex flex-col gap-2">
                <Link href={`/create/parcours/${item.id}`} className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 border-none shadow-none font-bold py-6 rounded-2xl transition-all flex items-center justify-between px-6 group/btn cursor-pointer">
                    Modifier le parcours
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
                      <AlertDialogTitle>Supprimer ce parcours ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Toutes les étapes et la progression
                        des élèves seront supprimées.
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
