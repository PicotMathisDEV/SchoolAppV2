import {
  getStudentCompletedQuizzes,
  getStudentDirectQuizzes,
} from "@/src/lib/actions/parcours-action";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ListOrdered,
  RotateCcw,
  Trophy,
} from "lucide-react";
import DropMenu from "@/app/_components/DropMenu";

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const color =
    pct >= 80
      ? "text-emerald-600 bg-emerald-50"
      : pct >= 50
      ? "text-amber-600 bg-amber-50"
      : "text-red-600 bg-red-50";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}/{total} — {pct}%
    </span>
  );
}

export default async function MyQuizzesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [parcoursResults, directQuizzes] = await Promise.all([
    getStudentCompletedQuizzes(),
    getStudentDirectQuizzes(),
  ]);

  const hasAnything = parcoursResults.length > 0 || directQuizzes.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" /> Retour
          </Link>
          <div className="h-4 w-px bg-slate-200 shrink-0" />
          <div className="flex items-center gap-2 flex-1">
            <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="font-semibold text-slate-800 text-sm">Mes Quiz</span>
          </div>
          <DropMenu user={{ name: session.user.name, email: session.user.email, image: session.user.image, role: session.user.role }} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {!hasAnything && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun quiz disponible.</p>
          </div>
        )}

        {parcoursResults.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Via parcours
              </h2>
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                {parcoursResults.length}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
              {parcoursResults.map((result) => {
                const pct =
                  result.total > 0
                    ? Math.round((result.score / result.total) * 100)
                    : 0;
                return (
                  <Link
                    key={result.id}
                    href={`/dashboard/quiz/${result.quizId}`}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={result.quiz.image ?? "/quiz.png"}
                        alt={result.quiz.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {result.quiz.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(result.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ScoreBadge score={result.score} total={result.total} />
                      <Trophy
                        className={`w-3.5 h-3.5 ${pct >= 80 ? "text-amber-400" : "text-slate-300"}`}
                      />
                      <RotateCcw className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {directQuizzes.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Accès direct
              </h2>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {directQuizzes.length}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
              {directQuizzes.map((quiz) => {
                const pct =
                  quiz.bestResult && quiz.bestResult.total > 0
                    ? Math.round((quiz.bestResult.score / quiz.bestResult.total) * 100)
                    : null;
                return (
                  <Link
                    key={quiz.id}
                    href={`/dashboard/quiz/${quiz.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={quiz.image ?? "/quiz.png"}
                        alt={quiz.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {quiz.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {quiz._count.questions} question{quiz._count.questions !== 1 ? "s" : ""}
                        {" · "}{quiz.teacher.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {quiz.bestResult ? (
                        <>
                          <ScoreBadge
                            score={quiz.bestResult.score}
                            total={quiz.bestResult.total}
                          />
                          <Trophy
                            className={`w-3.5 h-3.5 ${pct !== null && pct >= 80 ? "text-amber-400" : "text-slate-300"}`}
                          />
                          <RotateCcw className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-slate-400">Non tenté</span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
