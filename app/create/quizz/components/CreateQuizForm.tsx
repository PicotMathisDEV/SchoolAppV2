"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createQuiz } from "@/src/lib/actions/quiz-action";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CreateQuizForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { title: "", description: "" },
  });

  const onSubmit = async (data: { title: string; description: string }) => {
    try {
      const result = await createQuiz({ title: data.title, description: data.description });
      toast.success("Quiz créé !");
      router.push(`/create/quizz/${result.id}`);
    } catch {
      toast.error("Erreur lors de la création du quiz");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto flex flex-col gap-6 pb-20 mt-12"
    >
      <div className="flex flex-col gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-bold text-blue-600">Titre du Quiz</Label>
          <Input
            {...register("title", { required: true })}
            className="text-lg font-semibold"
            placeholder="Ex: Les bases de la programmation"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-bold text-blue-600">Description (Optionnel)</Label>
          <Textarea
            {...register("description")}
            className="h-20 resize-none"
            placeholder="De quoi parle ce quiz ?"
            maxLength={500}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Vous ajouterez les questions et l&apos;image depuis l&apos;éditeur qui s&apos;ouvrira après la création.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:bg-gray-400 cursor-pointer"
        >
          {isSubmitting ? "Création..." : "Créer le Quiz →"}
        </button>
      </div>
    </form>
  );
}
