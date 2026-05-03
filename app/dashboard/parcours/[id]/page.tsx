import { getParcoursForStudent } from "@/src/lib/actions/parcours-action";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  HelpCircle,
  Trophy,
} from "lucide-react";
import DropMenu from "@/app/_components/DropMenu";

type Props = { params: Promise<{ id: string }> };

export default async function ParcoursPage({ params }: Props) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  let parcours;
  try {
    parcours = await getParcoursForStudent(id);
  } catch {
    notFound();
  }

  const progressPct =
    parcours.totalSteps > 0
      ? Math.round((parcours.completedSteps / parcours.totalSteps) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" /> Retour
          </Link>
          <div className="h-4 w-px bg-slate-200 shrink-0" />
          <span className="font-semibold text-slate-800 text-sm truncate flex-1">
            {parcours.title}
          </span>
          <DropMenu user={{ name: session.user.name, email: session.user.email, image: session.user.image, role: session.user.role }} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{parcours.title}</h1>
          <p className="text-sm text-slate-400 mb-4">Par {parcours.teacherName}</p>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Progression</span>
              <span>
                {parcours.completedSteps}/{parcours.totalSteps} étape
                {parcours.totalSteps !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-right text-xs text-slate-400">{progressPct}%</p>
          </div>
        </div>

        <div className="space-y-4">
          {parcours.steps.map((step, i) => {
            const locked = !step.unlocked;
            const done = step.stepDone;

            return (
              <div
                key={step.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  locked
                    ? "border-slate-100 opacity-60"
                    : done
                    ? "border-emerald-100"
                    : "border-violet-100"
                }`}
              >

                <div
                  className={`px-5 py-3 flex items-center justify-between text-xs font-black uppercase tracking-widest ${
                    locked
                      ? "bg-slate-50 text-slate-400"
                      : done
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-violet-50 text-violet-600"
                  }`}
                >
                  <span>Étape {i + 1}</span>
                  {locked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : done ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  )}
                </div>

                <div className="p-5 space-y-4">

                  {step.lesson && (
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                        <Image
                          src={step.lesson.image ?? "/lesson.png"}
                          alt={step.lesson.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                            Leçon
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {step.lesson.title}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {step.lessonDone ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Lu
                          </span>
                        ) : locked ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                            <Lock className="w-3 h-3" /> Verrouillé
                          </span>
                        ) : (
                          <Link
                            href={`/dashboard/lesson/${step.lesson.id}?step=${step.id}&parcours=${id}`}
                            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                          >
                            Lire <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {step.lesson && step.quiz && (
                    <div className="h-px bg-slate-100" />
                  )}

                  {step.quiz && (
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                        <Image
                          src={step.quiz.image ?? "/quiz.png"}
                          alt={step.quiz.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                            Quiz
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {step.quiz.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {step.quiz._count.questions} question
                          {step.quiz._count.questions !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {step.quizResult ? (
                          <>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                              <Trophy className="w-3.5 h-3.5" />
                              {step.quizResult.score}/{step.quizResult.total}
                            </span>
                            <Link
                              href={`/dashboard/quiz/${step.quiz.id}`}
                              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
                            >
                              Refaire
                            </Link>
                          </>
                        ) : locked || !step.lessonDone ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                            <Lock className="w-3 h-3" />{" "}
                            {!step.lessonDone && !locked
                              ? "Lisez la leçon"
                              : "Verrouillé"}
                          </span>
                        ) : (
                          <Link
                            href={`/dashboard/quiz/${step.quiz.id}`}
                            className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
                          >
                            Faire <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {parcours.completedSteps === parcours.totalSteps &&
          parcours.totalSteps > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="font-bold text-emerald-800">
                Parcours terminé ! Félicitations 🎉
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
