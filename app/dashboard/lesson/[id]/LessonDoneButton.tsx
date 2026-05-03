"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markLessonDone } from "@/src/lib/actions/parcours-action";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LessonDoneButton({
  stepId,
  parcoursId,
}: {
  stepId: string;
  parcoursId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        await markLessonDone(stepId);
        router.push(`/dashboard/parcours/${parcoursId}`);
      } catch {
        toast.error("Erreur lors de la validation");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md disabled:opacity-60 transition-all cursor-pointer"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CheckCircle2 className="w-4 h-4" />
      )}
      {isPending ? "Validation…" : "J'ai terminé cette leçon"}
    </button>
  );
}
