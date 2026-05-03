"use client";

import { useSession } from "@/src/lib/auth-client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  getParcoursForEdit,
  getTeacherResources,
  saveParcoursEdit,
} from "@/src/lib/actions/parcours-action";
import DropMenu from "../../../_components/DropMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Parcours = Awaited<ReturnType<typeof getParcoursForEdit>>;
type Resources = Awaited<ReturnType<typeof getTeacherResources>>;
type StepForm = { lessonId: string; quizId: string };

export default function ParcoursEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [parcours, setParcours] = useState<Parcours | null>(null);
  const [resources, setResources] = useState<Resources | null>(null);
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState<StepForm[]>([]);
  const [classIds, setClassIds] = useState<string[]>([]);
  const [saving, startSaving] = useTransition();

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    if (!isPending && session?.user.role !== "teacher") router.push("/dashboard");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    Promise.all([getParcoursForEdit(id), getTeacherResources()])
      .then(([p, r]) => {
        setParcours(p);
        setResources(r);
        setTitle(p.title);
        setSteps(
          p.steps.map((s) => ({
            lessonId: s.lessonId ?? "",
            quizId: s.quizId ?? "",
          })),
        );
        setClassIds(p.classes.map((c) => c.id));
      })
      .catch(() => router.push("/create/parcours"));
  }, [session, id, router]);

  const addStep = () =>
    setSteps((prev) => [...prev, { lessonId: "", quizId: "" }]);

  const removeStep = (i: number) =>
    setSteps((prev) => prev.filter((_, idx) => idx !== i));

  const moveStep = (i: number, dir: -1 | 1) => {
    setSteps((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const updateStep = (i: number, field: keyof StepForm, val: string) =>
    setSteps((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)),
    );

  const toggleClass = (cid: string) =>
    setClassIds((prev) =>
      prev.includes(cid) ? prev.filter((id) => id !== cid) : [...prev, cid],
    );

  const handleSave = () => {
    startSaving(async () => {
      try {
        await saveParcoursEdit(id, {
          title,
          steps: steps.map((s) => ({
            lessonId: s.lessonId || null,
            quizId: s.quizId || null,
          })),
          classIds,
        });
        toast.success("Parcours sauvegardé");
      } catch {
        toast.error("Erreur lors de la sauvegarde");
      }
    });
  };

  if (isPending || !session?.user || !parcours || !resources) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Chargement…</p>
      </div>
    );
  }

  const hasChange =
    title !== parcours.title ||
    JSON.stringify(steps) !==
      JSON.stringify(
        parcours.steps.map((s) => ({
          lessonId: s.lessonId ?? "",
          quizId: s.quizId ?? "",
        })),
      ) ||
    JSON.stringify(classIds.sort()) !==
      JSON.stringify(parcours.classes.map((c) => c.id).sort());

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/create/parcours"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Parcours
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <span className="font-semibold text-slate-800 text-sm truncate max-w-xs">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChange}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "Sauvegarde…" : "Sauvegarder"}
            </Button>
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
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <label className="text-sm font-semibold text-slate-600 block mb-2">
            Titre du parcours
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre…"
            className="text-base font-semibold"
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Étapes ({steps.length})
            </h2>
            <Button
              variant="outline"
              onClick={addStep}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Ajouter une étape
            </Button>
          </div>

          {steps.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <p className="text-slate-400 text-sm">
                Aucune étape. Cliquez sur &quot;Ajouter une étape&quot; pour commencer.
              </p>
            </div>
          )}

          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Étape {i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveStep(i, -1)}
                    disabled={i === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => moveStep(i, 1)}
                    disabled={i === steps.length - 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => removeStep(i)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors cursor-pointer ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Leçon
                  </label>
                  <select
                    value={step.lessonId}
                    onChange={(e) => updateStep(i, "lessonId", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— Aucune leçon —</option>
                    {resources.lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mb-1.5">
                    <HelpCircle className="w-3.5 h-3.5" /> Quiz
                  </label>
                  <select
                    value={step.quizId}
                    onChange={(e) => updateStep(i, "quizId", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">— Aucun quiz —</option>
                    {resources.quizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!step.lessonId && !step.quizId && (
                <p className="text-xs text-amber-500 mt-3">
                  ⚠ Cette étape n&apos;a ni leçon ni quiz — elle sera vide pour les élèves.
                </p>
              )}
            </div>
          ))}
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">
            Assigner aux classes
          </h2>
          {resources.classes.length === 0 ? (
            <p className="text-sm text-slate-400">Vous n&apos;avez pas encore de classes.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {resources.classes.map((c) => {
                const checked = classIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleClass(c.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer ${
                      checked
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                    }`}
                  >
                    {checked ? "✓ " : ""}Classe {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || !hasChange}
            size="lg"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? "Sauvegarde…" : "Sauvegarder les modifications"}
          </Button>
        </div>
      </div>
    </div>
  );
}
