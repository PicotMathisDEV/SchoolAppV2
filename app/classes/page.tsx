"use client";

import { getMyClass } from "@/src/lib/actions/get-classes";
import { useEffect, useState } from "react";
import DropMenu from "../_components/DropMenu";
import { useSession } from "@/src/lib/auth-client";
import Image from "next/image";
import { BookOpen, HelpCircle, Users } from "lucide-react";
import Link from "next/link";

type ClassData = Awaited<ReturnType<typeof getMyClass>>;

export default function ClassePage() {
  const [classe, setClasse] = useState<ClassData>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;
    getMyClass().then(setClasse).catch(() => {});
  }, [session]);

  if (!session) return null;

  const students = classe?.students ?? [];
  const lessons = classe?.lessons ?? [];
  const quizzes = classe?.quizzes ?? [];
  const classmatesCount = students.filter((s) => s.id !== session.user.id).length;

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="border-b bg-white shadow-sm mb-8">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 px-3 py-1.5 rounded-lg text-white font-bold text-sm">
              {classe?.name?.toUpperCase() || "?"}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              {classe ? `Classe ${classe.name}` : "Ma classe"}
            </h1>
            {classe?.teacher && (
              <span className="text-sm text-slate-400">· Prof. {classe.teacher.name}</span>
            )}
          </div>
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

      {!classe ? (
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-slate-400">Vous n&apos;êtes inscrit dans aucune classe.</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 space-y-12 pb-16">

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-800">
                Camarades <span className="text-slate-400 font-normal text-sm">({classmatesCount})</span>
              </h2>
            </div>

            {students.length === 0 ? (
              <p className="text-slate-400 text-sm italic">Aucun camarade pour l&apos;instant.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                      {student.image ? (
                        <Image width={40} height={40} src={student.image} alt={student.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-slate-500 font-bold text-sm">{student.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">
                        {student.name} {student.id === session.user.id && <span className="text-blue-500">(Moi)</span>}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-800">
                Leçons <span className="text-slate-400 font-normal text-sm">({lessons.length})</span>
              </h2>
            </div>

            {lessons.length === 0 ? (
              <p className="text-slate-400 text-sm italic">Aucune leçon attribuée à cette classe.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/lesson/${lesson.id}`}
                    className="group flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-blue-50">
                      <Image src={lesson.image || "/lesson.png"} alt={lesson.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Par {lesson.teacherName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">
                Quiz <span className="text-slate-400 font-normal text-sm">({quizzes.length})</span>
              </h2>
            </div>

            {quizzes.length === 0 ? (
              <p className="text-slate-400 text-sm italic">Aucun quiz attribué à cette classe.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/dashboard/quiz/${quiz.id}`}
                    className="group flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-md transition-all"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-indigo-50">
                      <Image src={quiz.image || "/quiz.png"} alt={quiz.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {quiz.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {quiz._count.questions} question{quiz._count.questions !== 1 ? "s" : ""}
                        {quiz.description && ` · ${quiz.description}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
}
