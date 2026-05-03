"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { getClassStudentProgress } from "@/src/lib/actions/action";
import DropMenu from "@/app/_components/DropMenu";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, Circle, HelpCircle, ListOrdered, XCircle } from "lucide-react";

type Progress = Awaited<ReturnType<typeof getClassStudentProgress>>;

export default function SuiviPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [data, setData] = useState<Progress>(null);

  useEffect(() => {
    if (id) getClassStudentProgress(id).then(setData).catch(() => {});
  }, [id]);

  if (!session?.user || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Chargement…</p>
      </div>
    );
  }

  const students = data.students;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="border-b bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/gestion/${id}`} className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="bg-blue-600 px-3 py-1.5 rounded-lg text-white font-bold text-sm">
              {data.name?.toUpperCase()}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Suivi des élèves
            </h1>
          </div>
          <DropMenu user={{ name: session.user.name, email: session.user.email, image: session.user.image, role: session.user.role }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-10">

        {students.length === 0 && (
          <div className="text-center py-20 text-slate-400">Aucun élève dans cette classe.</div>
        )}

        {data.parcours.map((parcours) => {
          const totalSteps = parcours.steps.length;
          return (
            <section key={parcours.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <ListOrdered className="w-5 h-5 text-blue-600 shrink-0" />
                <h2 className="font-bold text-slate-800">{parcours.title}</h2>
                <span className="text-xs text-slate-400 ml-1">{totalSteps} étape{totalSteps !== 1 ? "s" : ""}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-6 py-3 text-slate-500 font-semibold w-48">Élève</th>
                      <th className="text-center px-4 py-3 text-slate-500 font-semibold">Progression</th>
                      {parcours.steps.map((step) => (
                        <th key={step.id} className="text-center px-3 py-3 text-slate-500 font-semibold min-w-32">
                          <div className="flex flex-col items-center gap-0.5">
                            {step.lesson && (
                              <span className="flex items-center gap-1 text-xs text-blue-500">
                                <BookOpen className="w-3 h-3" /> {step.lesson.title.slice(0, 15)}{step.lesson.title.length > 15 ? "…" : ""}
                              </span>
                            )}
                            {step.quiz && (
                              <span className="flex items-center gap-1 text-xs text-indigo-500">
                                <HelpCircle className="w-3 h-3" /> {step.quiz.title.slice(0, 15)}{step.quiz.title.length > 15 ? "…" : ""}
                              </span>
                            )}
                            <span className="text-slate-300 text-xs">Étape {step.order + 1}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, si) => {
                      const completedSteps = parcours.steps.filter((step) =>
                        step.completions.some((c) => c.userId === student.id)
                      ).length;
                      const pct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                      return (
                        <tr key={student.id} className={si % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden shrink-0">
                                {student.image ? (
                                  <Image src={student.image} alt={student.name} width={28} height={28} className="object-cover w-full h-full" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                                    {student.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <span className="font-medium text-slate-800 truncate max-w-32">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-400">{completedSteps}/{totalSteps}</span>
                            </div>
                          </td>
                          {parcours.steps.map((step) => {
                            const completion = step.completions.find((c) => c.userId === student.id);
                            const lessonDone = completion?.lessonDone ?? false;
                            const stepDone = !!completion;

                            return (
                              <td key={step.id} className="px-3 py-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  {step.lesson && (
                                    <span title={lessonDone ? "Leçon lue" : "Non lue"}>
                                      {lessonDone ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      ) : stepDone ? (
                                        <CheckCircle2 className="w-4 h-4 text-slate-300" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-slate-200" />
                                      )}
                                    </span>
                                  )}
                                  {step.quiz && (() => {
                                    const result = data.quizzes
                                      .find((q) => q.id === step.quiz?.id)
                                      ?.results.find((r) => r.userId === student.id);
                                    if (!result) return <XCircle className="w-4 h-4 text-slate-200" />;
                                    const score = Math.round((result.score / result.total) * 100);
                                    return (
                                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                        score >= 70 ? "bg-emerald-100 text-emerald-700" :
                                        score >= 40 ? "bg-amber-100 text-amber-700" :
                                        "bg-red-100 text-red-700"
                                      }`}>
                                        {result.score}/{result.total}
                                      </span>
                                    );
                                  })()}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

        {data.quizzes.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
              <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0" />
              <h2 className="font-bold text-slate-800">Quiz assignés directement</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-slate-500 font-semibold w-48">Élève</th>
                    {data.quizzes.map((quiz) => (
                      <th key={quiz.id} className="text-center px-4 py-3 text-slate-500 font-semibold min-w-36">
                        <div className="flex flex-col items-center gap-0.5">
                          <span>{quiz.title.slice(0, 18)}{quiz.title.length > 18 ? "…" : ""}</span>
                          <span className="text-slate-300 text-xs font-normal">{quiz._count.questions} questions</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, si) => (
                    <tr key={student.id} className={si % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden shrink-0">
                            {student.image ? (
                              <Image src={student.image} alt={student.name} width={28} height={28} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                                {student.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-slate-800 truncate max-w-32">{student.name}</span>
                        </div>
                      </td>
                      {data.quizzes.map((quiz) => {
                        const result = quiz.results.find((r) => r.userId === student.id);
                        if (!result) {
                          return (
                            <td key={quiz.id} className="px-4 py-3 text-center">
                              <span className="text-xs text-slate-300 italic">Non tenté</span>
                            </td>
                          );
                        }
                        const score = Math.round((result.score / result.total) * 100);
                        return (
                          <td key={quiz.id} className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                                score >= 70 ? "bg-emerald-100 text-emerald-700" :
                                score >= 40 ? "bg-amber-100 text-amber-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                {result.score}/{result.total}
                              </span>
                              <span className="text-xs text-slate-400">{score}%</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {data.parcours.length === 0 && data.quizzes.length === 0 && students.length > 0 && (
          <div className="text-center py-20 text-slate-400">
            <p>Aucun parcours ou quiz assigné à cette classe.</p>
          </div>
        )}
      </div>
    </div>
  );
}
