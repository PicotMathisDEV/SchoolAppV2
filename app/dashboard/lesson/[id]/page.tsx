import { getLessonForStudent } from "@/src/lib/actions/lesson-action";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ChevronLeft, Clock } from "lucide-react";
import LessonDoneButton from "./LessonDoneButton";
import DropMenu from "@/app/_components/DropMenu";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string; parcours?: string }>;
};

export default async function LessonPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { step: stepId, parcours: parcoursId } = await searchParams;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  let lesson;
  try {
    lesson = await getLessonForStudent(id);
  } catch {
    notFound();
  }

  const formattedDate = new Date(lesson.updatedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const backHref = parcoursId ? `/dashboard/parcours/${parcoursId}` : "/dashboard";
  const backLabel = parcoursId ? "Parcours" : "Retour";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky top bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            {backLabel}
          </Link>
          <div className="h-4 w-px bg-slate-200 shrink-0" />
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="font-semibold text-slate-800 truncate text-sm">
              {lesson.title}
            </span>
          </div>
          <DropMenu user={{ name: session.user.name, email: session.user.email, image: session.user.image, role: session.user.role }} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Cover image */}
        {lesson.image && lesson.image !== "/lesson.png" && (
          <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-8 shadow-sm">
            <Image
              src={lesson.image}
              alt={lesson.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Title + meta */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{lesson.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>Par {lesson.teacherName}</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Lesson content */}
        {lesson.content ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div
              className="tiptap p-8 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">Cette leçon n&apos;a pas encore de contenu.</p>
          </div>
        )}

        {/* Parcours: mark lesson as done */}
        {stepId && parcoursId && (
          <div className="mt-8 flex justify-end">
            <LessonDoneButton stepId={stepId} parcoursId={parcoursId} />
          </div>
        )}
      </div>
    </div>
  );
}
