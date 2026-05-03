"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createStudentAndAssignToClass,
  ModifyClassName,
  RemoveClass,
  RemoveStudentFromClass,
  getOneClass,
  generateInviteCode,
} from "@/src/lib/actions/action";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "@/src/lib/auth-client";
import DropMenu from "@/app/_components/DropMenu";
import {
  BookOpen,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Pencil,
  Trash2Icon,
  Settings2,
  Plus,
  ExternalLink,
  Link2,
  Copy,
  RefreshCw,
  ListOrdered,
  BarChart2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Classe {
  id: string;
  name: string;
  inviteCode: string | null;
  students: { id: string; name: string; email: string; image: string | null; password: string | null }[];
  lessons: { id: string; title: string; image: string | null }[];
  quizzes: {
    id: string;
    title: string;
    image: string | null;
    _count: { questions: number };
  }[];
  parcours: {
    id: string;
    title: string;
    image: string | null;
    _count: { steps: number };
  }[];
}

export default function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentClass, setCurrentClass] = useState<Classe | null>(null);
  const [newName, setNewName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const togglePassword = (studentId: string) =>
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const refetch = useCallback(async () => {
    if (!params.id) return;
    const data = await getOneClass(params.id as string);
    setCurrentClass(data as Classe);
  }, [params.id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (!session) return null;

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createStudentAndAssignToClass(email, password, name, params.id as string);
      toast.success(`Élève ajouté à la classe ${currentClass?.name}`);
      setName("");
      setEmail("");
      setPassword("");
      await refetch();
    } catch {
      toast.error("Erreur lors de l'ajout de l'élève");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || !currentClass?.id) return;
    try {
      await ModifyClassName(currentClass.id, newName);
      toast.success("Nom modifié");
      setIsEditModalOpen(false);
      await refetch();
    } catch {
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDeleteClass = async () => {
    if (!currentClass?.id) return;
    try {
      await RemoveClass(currentClass.id);
      toast.success("Classe supprimée");
      router.push("/gestion");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!currentClass?.id) return;
    try {
      await RemoveStudentFromClass(studentId, currentClass.id);
      toast.success("Élève retiré");
      await refetch();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">

      <div className="border-b bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg text-white font-bold text-sm">
              {currentClass?.name?.toUpperCase() || "CL"}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Classe {currentClass?.name}
            </h1>
          </div>
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

      <main className="max-w-7xl mx-auto px-6 space-y-10">

        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-slate-500 text-sm">Gestion des élèves</p>
              <p className="text-2xl font-semibold text-slate-900">
                {currentClass?.students?.length ?? 0} élève
                {(currentClass?.students?.length ?? 0) !== 1 ? "s" : ""} inscrits
              </p>
            </div>

            <div className="flex items-center gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer gap-2">
                    <Plus className="w-4 h-4" /> Ajouter un élève
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Ajouter un élève</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cet élève sera ajouté à la classe{" "}
                      <strong>{currentClass?.name}</strong>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <form className="grid gap-4" onSubmit={handleAddStudent}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom de l&apos;élève</Label>
                        <Input
                          id="name"
                          placeholder="Jean Dupont"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="jean@ecole.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-password">Mot de passe provisoire</Label>
                      <Input
                        id="student-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                      />
                      <p className="text-xs text-slate-400">
                        L&apos;élève pourra le changer depuis ses paramètres.
                      </p>
                    </div>
                  </form>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={isSubmitting}
                      onClick={handleAddStudent}
                      className="bg-blue-600! hover:bg-blue-700! cursor-pointer"
                    >
                      {isSubmitting ? "Création..." : "Confirmer"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Link href={`/gestion/${params.id}/suivi`}>
                <Button variant="outline" className="gap-2 cursor-pointer">
                  <BarChart2 className="w-4 h-4" /> Suivi élèves
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 cursor-pointer">
                    <Settings2 className="w-4 h-4" /> Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Paramètres classe</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setIsEditModalOpen(true)}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Modifier le nom
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setIsDeleteModalOpen(true)}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <Trash2Icon className="mr-2 h-4 w-4" /> Supprimer la classe
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {currentClass?.students.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-white/50">
              <p className="text-slate-500 font-medium">Cette classe est encore vide.</p>
              <p className="text-slate-400 text-sm">Commencez par ajouter un élève.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentClass?.students.map((student) => (
                <Card
                  key={student.id}
                  className="group hover:border-blue-300 transition-all hover:shadow-lg overflow-hidden border-slate-200"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative h-20 w-20">
                        <Image
                          src={student.image || "/user.svg"}
                          alt={student.name}
                          className="rounded-full border-2 border-white shadow-sm object-cover"
                          fill
                        />
                      </div>
                      <div className="space-y-1 text-center">
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium truncate max-w-40">
                          {student.email}
                        </p>
                        {student.password && (
                          <div className="flex items-center justify-center gap-1.5 mt-1">
                            <KeyRound className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="text-xs font-mono text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                              {visiblePasswords.has(student.id)
                                ? student.password
                                : "••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePassword(student.id)}
                              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              title={visiblePasswords.has(student.id) ? "Masquer" : "Voir le mdp provisoire"}
                            >
                              {visiblePasswords.has(student.id)
                                ? <EyeOff className="w-3.5 h-3.5" />
                                : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-red-500 hover:text-red-600 cursor-pointer"
                          >
                            Retirer de la classe
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Retirer l&apos;élève ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              <strong>{student.name}</strong> sera retiré de la classe{" "}
                              <strong>{currentClass?.name}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700 cursor-pointer"
                              onClick={() => handleRemoveStudent(student.id)}
                            >
                              Confirmer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Lien d&apos;invitation</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Envoyez ce lien à vos élèves pour qu&apos;ils rejoignent la classe directement.
          </p>

          {currentClass?.inviteCode ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-sm text-slate-700 min-w-0">
                <span className="truncate">
                  {typeof window !== "undefined" ? window.location.origin : ""}/join/{currentClass.inviteCode}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  className="gap-2 cursor-pointer"
                  onClick={() => {
                    const url = `${window.location.origin}/join/${currentClass.inviteCode}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Lien copié !");
                  }}
                >
                  <Copy className="w-4 h-4" /> Copier
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 cursor-pointer text-slate-500"
                  onClick={async () => {
                    await generateInviteCode(currentClass.id);
                    await refetch();
                    toast.success("Nouveau lien généré");
                  }}
                >
                  <RefreshCw className="w-4 h-4" /> Regénérer
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer gap-2"
              onClick={async () => {
                await generateInviteCode(currentClass!.id);
                await refetch();
                toast.success("Lien d'invitation créé !");
              }}
            >
              <Link2 className="w-4 h-4" /> Générer un lien d&apos;invitation
            </Button>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Leçons attribuées
            </h2>
            <span className="text-sm text-slate-400 font-medium ml-1">
              ({currentClass?.lessons.length ?? 0})
            </span>
          </div>

          {!currentClass?.lessons.length ? (
            <div className="text-center py-10 border-2 border-dashed rounded-2xl bg-white/50">
              <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">
                Aucune leçon attribuée à cette classe.
              </p>
              <p className="text-slate-300 text-xs mt-1">
                Allez dans{" "}
                <Link href="/create/lesson" className="underline text-blue-400">
                  Mes leçons
                </Link>{" "}
                pour partager du contenu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentClass.lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/create/lesson/${lesson.id}`}
                  className="group flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-blue-50">
                    <Image
                      src={lesson.image || "/lesson.png"}
                      alt={lesson.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {lesson.title}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Quiz attribués
            </h2>
            <span className="text-sm text-slate-400 font-medium ml-1">
              ({currentClass?.quizzes.length ?? 0})
            </span>
          </div>

          {!currentClass?.quizzes.length ? (
            <div className="text-center py-10 border-2 border-dashed rounded-2xl bg-white/50">
              <HelpCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">
                Aucun quiz attribué à cette classe.
              </p>
              <p className="text-slate-300 text-xs mt-1">
                Allez dans{" "}
                <Link href="/create/quizz" className="underline text-indigo-400">
                  Mes quiz
                </Link>{" "}
                pour en attribuer un.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentClass.quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  href={`/create/quizz/${quiz.id}`}
                  className="group flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-md transition-all"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-indigo-50">
                    <Image
                      src={quiz.image || "/quiz.png"}
                      alt={quiz.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {quiz.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {quiz._count.questions} question
                      {quiz._count.questions !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <ListOrdered className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">Parcours attribués</h2>
            <span className="text-sm text-slate-400 font-medium ml-1">
              ({currentClass?.parcours.length ?? 0})
            </span>
          </div>

          {!currentClass?.parcours.length ? (
            <div className="text-center py-10 border-2 border-dashed rounded-2xl bg-white/50">
              <ListOrdered className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Aucun parcours attribué à cette classe.</p>
              <p className="text-slate-300 text-xs mt-1">
                Allez dans{" "}
                <Link href="/create/parcours" className="underline text-blue-400">
                  Mes parcours
                </Link>{" "}
                pour en attribuer un.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentClass.parcours.map((p) => (
                <Link
                  key={p.id}
                  href={`/create/parcours/${p.id}`}
                  className="group flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-blue-50">
                    <Image
                      src={p.image || "/lesson.png"}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {p.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {p._count.steps} étape{p._count.steps !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <AlertDialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifier le nom</AlertDialogTitle>
            <AlertDialogDescription>
              Nouveau nom pour la classe <strong>{currentClass?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="ex: T01"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRename}
              className="bg-blue-600! hover:bg-blue-700! cursor-pointer"
            >
              Sauvegarder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la classe ?</AlertDialogTitle>
            <AlertDialogDescription>
              La classe <strong>{currentClass?.name}</strong> sera supprimée
              définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClass}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
