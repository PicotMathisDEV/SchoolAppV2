"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAttempt } from "@/src/lib/actions/quiz-attempt-action";
import { ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import DropMenu from "@/app/_components/DropMenu";

type Option = { id: string; text: string | null; image: string | null };
type Question = {
  id: string;
  content: string;
  image: string | null;
  options: Option[];
};
type Quiz = {
  id: string;
  title: string;
  image: string | null;
  description: string | null;
  questions: Question[];
};
type User = { name: string | null; email: string | null; image: string | null | undefined; role: string | null | undefined };

export default function QuizPlayer({ quiz, user }: { quiz: Quiz; user: User }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [isPending, startTransition] = useTransition();

  const total = quiz.questions.length;
  const question = quiz.questions[step];
  const selected = answers[question.id] ?? null;
  const pct = Math.round(((step + 1) / total) * 100);
  const isLast = step === total - 1;

  const select = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: prev[question.id] === optionId ? null : optionId,
    }));
  };

  const handleSubmit = () => {
    const unanswered = quiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(`${unanswered.length} question${unanswered.length > 1 ? "s" : ""} sans réponse`);
      return;
    }
    startTransition(async () => {
      try {
        const payload = quiz.questions.map((q) => ({
          questionId: q.id,
          selectedOptionId: answers[q.id] ?? null,
        }));
        const { resultId } = await submitQuizAttempt(quiz.id, payload);
        router.push(`/dashboard/quiz/${quiz.id}/result/${resultId}`);
      } catch {
        toast.error("Erreur lors de la soumission");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-bold text-slate-800 truncate">{quiz.title}</h1>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <span className="text-sm text-slate-400 font-medium">
                {step + 1} / {total}
              </span>
              <DropMenu user={user} />
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-8 gap-6">

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex gap-4">
          {question.image && (
            <div className="relative w-18 h-18 shrink-0 rounded-xl overflow-hidden border border-slate-100">

              <img
                src={question.image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
              Question {step + 1}
            </span>
            <p className="text-slate-800 font-semibold text-lg mt-1 leading-snug">
              {question.content}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => select(opt.id)}
                className={`group relative flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer
                  ${isSelected
                    ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                    : "border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/40 shadow-sm"
                  }`}
              >

                <div
                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors
                    ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-300 group-hover:border-indigo-300"}`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                {opt.image ? (
                  <div className="flex items-center gap-3">

                    <img
                      src={opt.image}
                      alt=""
                      className="w-16 h-16 object-cover rounded-xl border border-slate-100"
                    />
                    {opt.text && (
                      <span className="text-sm font-medium text-slate-700">{opt.text}</span>
                    )}
                  </div>
                ) : (
                  <span className={`text-sm font-medium ${isSelected ? "text-indigo-700" : "text-slate-700"}`}>
                    {opt.text}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>

          <div className="flex gap-1.5">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  i === step
                    ? "bg-indigo-500 w-5"
                    : answers[quiz.questions[i].id]
                    ? "bg-indigo-200"
                    : "bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md disabled:opacity-60 transition-all cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isPending ? "Envoi…" : "Terminer"}
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
