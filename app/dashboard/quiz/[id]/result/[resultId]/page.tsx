import { getQuizResult } from "@/src/lib/actions/quiz-attempt-action";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Home, RotateCcw, Trophy, ChevronLeft } from "lucide-react";
import Image from "next/image";
import DropMenu from "@/app/_components/DropMenu";

type Props = { params: Promise<{ id: string; resultId: string }> };

export default async function ResultPage({ params }: Props) {
  const { id, resultId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  let result;
  try {
    result = await getQuizResult(resultId);
  } catch {
    notFound();
  }

  const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
  const emoji = pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚";
  const scoreColor =
    pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-500" : "text-red-500";
  const bgColor =
    pct >= 80 ? "from-emerald-50 to-white" : pct >= 50 ? "from-amber-50 to-white" : "from-red-50 to-white";
  const barColor =
    pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href={`/dashboard/quiz/${id}`}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" /> Quiz
          </Link>
          <div className="h-4 w-px bg-slate-200 shrink-0" />
          <span className="font-semibold text-slate-800 text-sm truncate flex-1">
            {result.quiz.title}
          </span>
          <DropMenu user={{ name: session.user.name, email: session.user.email, image: session.user.image, role: session.user.role }} />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <div className={`bg-gradient-to-b ${bgColor} rounded-3xl border border-slate-100 shadow-sm p-8 text-center`}>
          <div className="text-5xl mb-3">{emoji}</div>
          <h1 className="text-2xl font-black text-slate-800 mb-1">{result.quiz.title}</h1>
          <p className="text-sm text-slate-400 mb-6">
            {new Date(result.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>

          <div className={`text-6xl font-black ${scoreColor} mb-1`}>
            {result.score}<span className="text-3xl text-slate-300">/{result.total}</span>
          </div>
          <p className="text-slate-500 font-medium mb-5">{pct}% de bonnes réponses</p>

          <div className="h-3 bg-slate-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className={`h-full ${barColor} rounded-full transition-all`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {pct === 100 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-amber-500 font-bold text-sm">
              <Trophy className="w-4 h-4" /> Parfait !
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="font-bold text-slate-700 px-1">Détail des réponses</h2>

          {result.answers.map((answer, i) => {
            const correctOption = answer.question.options.find((o) => o.isCorrect);
            const isCorrect = answer.isCorrect;

            return (
              <div
                key={answer.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  isCorrect ? "border-emerald-100" : "border-red-100"
                }`}
              >

                <div className={`px-5 py-3 flex items-start gap-3 ${
                  isCorrect ? "bg-emerald-50/60" : "bg-red-50/60"
                }`}>
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Question {i + 1}
                    </span>
                    <div className="flex items-start gap-3 mt-0.5">
                      {answer.question.image && (

                        <img
                          src={answer.question.image}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-100"
                        />
                      )}
                      <p className="font-semibold text-slate-800 text-sm leading-snug">
                        {answer.question.content}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-2">

                  {answer.selectedOption ? (
                    <div className={`flex items-center gap-2.5 text-sm rounded-xl px-3 py-2.5 ${
                      isCorrect
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}>
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 shrink-0" />
                      )}
                      {answer.selectedOption.image ? (

                        <img
                          src={answer.selectedOption.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                        />
                      ) : null}
                      <span className="font-medium">
                        {answer.selectedOption.text ?? "Image"}
                        <span className="font-normal opacity-70 ml-1">— votre réponse</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 text-sm rounded-xl px-3 py-2.5 bg-slate-50 text-slate-400">
                      <XCircle className="w-4 h-4" />
                      <span>Aucune réponse donnée</span>
                    </div>
                  )}

                  {!isCorrect && correctOption && (
                    <div className="flex items-center gap-2.5 text-sm rounded-xl px-3 py-2.5 bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {correctOption.image ? (

                        <img
                          src={correctOption.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                        />
                      ) : null}
                      <span className="font-medium">
                        {correctOption.text ?? "Image"}
                        <span className="font-normal opacity-70 ml-1">— bonne réponse</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Tableau de bord
          </Link>
          <Link
            href={`/dashboard/quiz/${id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Refaire le quiz
          </Link>
        </div>
      </div>
    </div>
  );
}
