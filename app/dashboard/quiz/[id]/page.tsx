import { getQuizForStudent } from "@/src/lib/actions/quiz-attempt-action";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import QuizPlayer from "./QuizPlayer";

type Props = { params: Promise<{ id: string }> };

export default async function QuizPage({ params }: Props) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  let quiz;
  try {
    quiz = await getQuizForStudent(id);
  } catch {
    notFound();
  }

  if (quiz.questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Ce quiz n&apos;a pas encore de questions.
      </div>
    );
  }

  return (
    <QuizPlayer
      quiz={quiz}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
      }}
    />
  );
}
