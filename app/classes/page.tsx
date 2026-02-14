"use client";

import { getMyClass } from "@/src/lib/actions/get-classes";
import { useEffect, useState } from "react";
import DropMenu from "../_components/DropMenu";
import { useSession } from "@/src/lib/auth-client";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Classe {
  id: string;
  name: string;
  students: {
    id: string;
    name: string;
    email: string;
    image: string;
  }[];
  lessons: {
    id: string;
    title: string;
    image: string;
    teacherName: string;
  }[];
}

export default function Classe() {
  const [classe, setClasse] = useState<Classe | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchMyClass = async () => {
      try {
        const data = await getMyClass();
        setClasse(data);
      } catch (error) {
        console.error("Erreur :", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchMyClass();
    } else {
      setLoading(false);
    }
  }, [session]);

  if (!session) return null;

  const students = classe?.students ?? [];
  const lessons = classe?.lessons ?? [];

  const classmatesCount = students.filter(
    (student) => student.id !== session.user.id,
  ).length;

  console.log(classe);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg text-white font-bold">
              {classe?.name?.toUpperCase() || "?"}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              {classe ? `Classe ${classe.name}` : "Aucune classe"}
            </h1>
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

      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-6">
          Mes camarades ({classmatesCount})
        </h2>

        {students.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                  {student.image ? (
                    <Image
                      width={48}
                      height={48}
                      src={student.image}
                      alt={student.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-500 font-medium">
                      {student.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-slate-900 truncate">
                    {student.name} {student.id === session.user.id && "(Moi)"}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    {student.email}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic">
            Aucun élève trouvé dans cette classe.
          </p>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        <h2 className="text-lg font-semibold text-slate-700 mb-6">
          Leçons de la classe ({lessons.length})
        </h2>

        {lessons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4">
            {lessons.map((item) => (
              <Card
                key={item.id}
                className="group relative flex flex-col overflow-hidden border-none shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 rounded-3xl bg-white"
              >
                <div className="relative h-44 overflow-hidden rounded-t-lg">
                  <Image
                    src={
                      item.image && item.image !== ""
                        ? item.image
                        : "/placeholder-lesson.png"
                    }
                    alt={item.title || "Illustration Leçon"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>

                <CardHeader className="p-5">
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-extrabold text-slate-800 line-clamp-1">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-bold text-slate-500 truncate">
                        {`Par ${item.teacherName}`}
                      </span>
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 -mt-6">
                  <Link href={`/lesson/${item.id}`} className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 border-none shadow-none font-bold py-6 rounded-2xl transition-all flex items-center justify-between px-6 group/btn cursor-pointer">
                      Acceder au contenu
                      <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic">
            Aucune leçon trouvée dans cette classe.
          </p>
        )}
      </div>
    </div>
  );
}
