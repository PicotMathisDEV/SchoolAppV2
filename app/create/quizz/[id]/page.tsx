"use client";

import { getOneQuiz } from "@/src/lib/actions/quiz-action";
import { useSession } from "@/src/lib/auth-client";
import { unauthorized, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuizDropSettings } from "./components/QuizDropSettings";
import QuizEditorForm from "./components/QuizEditorForm";
import Image from "next/image";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  classes: { id: string }[];
  questions: {
    id: string;
    content: string;
    image: string | null;
    options: { id: string; text: string | null; image: string | null; isCorrect: boolean }[];
  }[];
};

export default function QuizEditPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (params.id) {
        const data = await getOneQuiz(params.id as string);
        setQuiz(data as Quiz);
      }
    };
    fetchQuiz();
  }, [params.id]);

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

  if (!session?.user) return null;
  if (session.user.role !== "teacher") return unauthorized();

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Chargement du quiz...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <QuizDropSettings quiz={quiz} />

      <div className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-10">
          {quiz.image && (
            <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src={quiz.image}
                alt={quiz.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="mt-2 text-slate-500 text-sm">{quiz.description}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {quiz.questions.length} question
                {quiz.questions.length !== 1 ? "s" : ""}
              </span>
              {quiz.classes.length > 0 && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {quiz.classes.length} classe
                  {quiz.classes.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Editor */}
        <QuizEditorForm quizId={quiz.id} initialQuestions={quiz.questions} />
      </div>
    </div>
  );
}
