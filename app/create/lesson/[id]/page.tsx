"use client";

import DropMenu from "@/app/_components/DropMenu";
import SimpleEditor from "@/components/TipTapComp/simple-editor";
import { getOneLesson } from "@/src/lib/actions/lesson-action";
import { useSession } from "@/src/lib/auth-client";
import { unauthorized, useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DropMenuLesson } from "./DropMenuLesson";

interface Lesson {
  id: string;
  title: string;
  teacherId: string;
  teacherName: string;
  content: string;
  image: string;
  classes: { id: string; name?: string }[];
}

export default function Page() {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    const fetchLesson = async () => {
      if (params.id) {
        const data = await getOneLesson(params.id as string);
        setCurrentLesson(data);
      }
    };
    fetchLesson();
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

  if (!currentLesson) return <p>Chargement de la leçon...</p>;

  return (
    <div className="relative">
      <DropMenuLesson
        key={currentLesson.id + JSON.stringify(currentLesson.classes)}
        lesson={{
          name: currentLesson.title,
          id: currentLesson.id,
          image: currentLesson.image,
          classes: currentLesson.classes,
        }}
      />

      <div className="-z-10 absolute ">
        <SimpleEditor
          lesson={{
            content: currentLesson.content,
            name: currentLesson.title,
            id: currentLesson.id,
            image: currentLesson.image,
          }}
        />
      </div>
    </div>
  );
}
