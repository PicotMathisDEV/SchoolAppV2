import {
  getStudentCompletedLessons,
  getStudentDirectLessons,
} from "@/src/lib/actions/parcours-action";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ChevronLeft, ChevronRight, ListOrdered } from "lucide-react";
import DropMenu from "@/app/_components/DropMenu";

function LessonCard({
  lesson,
  badge,
}: {
  lesson: { id: string; title: string; image: string | null; teacherName: string };
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={`/dashboard/lesson/${lesson.id}`}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex"
    >
      <div className="relative w-20 h-20 shrink-0">
        <Image
          src={lesson.image ?? "/lesson.png"}
          alt={lesson.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <p className="font-bold text-slate-800 text-sm truncate">{lesson.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{lesson.teacherName}</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          {badge}
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors ml-auto" />
        </div>
      </div>
    </Link>
  );
}

export default async function MyLessonsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [parcoursLessons, directLessons] = await Promise.all([
    getStudentCompletedLessons(),
    getStudentDirectLessons(),
  ]);

  const hasAnything = parcoursLessons.length > 0 || directLessons.length > 0;

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
            <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="font-semibold text-slate-800 text-sm">Mes Leçons</span>
          </div>
          <DropMenu user={{ name: session.user.name, email: session.user.email, image: session.user.image, role: session.user.role }} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {!hasAnything && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune leçon disponible.</p>
          </div>
        )}

        {/* Via parcours */}
        {parcoursLessons.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Via parcours
              </h2>
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                {parcoursLessons.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parcoursLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  badge={
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ✓ Lu
                    </span>
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Accès direct */}
        {directLessons.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Accès direct
              </h2>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {directLessons.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {directLessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
