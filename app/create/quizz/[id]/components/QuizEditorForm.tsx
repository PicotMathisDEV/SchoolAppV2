"use client";

import {
  Control,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { updateQuizQuestions } from "@/src/lib/actions/quiz-action";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, ImagePlus, Plus, Type, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type OptionMode = "text" | "image";
type OptionValue = { mode: OptionMode; text: string; image: string; isCorrect: boolean };
type QuestionValue = { content: string; image: string; options: OptionValue[] };
type FormValues = { questions: QuestionValue[] };

type Props = {
  quizId: string;
  initialQuestions: {
    id: string;
    content: string;
    image: string | null;
    options: {
      id: string;
      text: string | null;
      image: string | null;
      isCorrect: boolean;
    }[];
  }[];
};

const emptyOption = (): OptionValue => ({ mode: "text", text: "", image: "", isCorrect: false });

export default function QuizEditorForm({ quizId, initialQuestions }: Props) {
  const defaultQuestions: QuestionValue[] =
    initialQuestions.length > 0
      ? initialQuestions.map((q) => ({
          content: q.content,
          image: q.image ?? "",
          options:
            q.options.length > 0
              ? q.options.map((o) => ({
                  mode: (o.image ? "image" : "text") as OptionMode,
                  text: o.text ?? "",
                  image: o.image ?? "",
                  isCorrect: o.isCorrect,
                }))
              : [emptyOption(), emptyOption()],
        }))
      : [
          {
            content: "",
            image: "",
            options: [emptyOption(), emptyOption()],
          },
        ];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: { questions: defaultQuestions } });

  const { fields: questionFields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const [questionPreviews, setQuestionPreviews] = useState<string[]>(
    defaultQuestions.map((q) => q.image),
  );

  const handleQuestionImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error("Image trop lourde (max 500 ko)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setQuestionPreviews((prev) => {
        const next = [...prev];
        next[index] = base64;
        return next;
      });
      setValue(`questions.${index}.image`, base64);
    };
    reader.readAsDataURL(file);
  };

  const removeQuestionImage = (index: number) => {
    setQuestionPreviews((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
    setValue(`questions.${index}.image`, "");
  };

  const onSubmit = async (data: FormValues) => {
    for (let i = 0; i < data.questions.length; i++) {
      const hasCorrect = data.questions[i].options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        toast.error(`Question ${i + 1} : sélectionnez la bonne réponse`);
        return;
      }
    }

    const payload = data.questions.map((q) => ({
      content: q.content,
      image: q.image || undefined,
      options: q.options.map((o) => ({
        text: o.mode === "text" ? o.text : undefined,
        image: o.mode === "image" ? o.image : undefined,
        isCorrect: o.isCorrect,
      })),
    }));
    const result = await updateQuizQuestions(quizId, payload);
    if (result.success) {
      toast.success("Quiz sauvegardé !");
    } else {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-20">
      {questionFields.map((field, qIndex) => (
        <div
          key={field.id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5"
        >
          {/* Question row */}
          <div className="flex items-start gap-4">
            {/* Question image 72×72 */}
            <div className="shrink-0 relative">
              <input
                type="file"
                accept="image/*"
                id={`q-img-${qIndex}`}
                className="hidden"
                onChange={(e) => handleQuestionImageChange(e, qIndex)}
              />
              <label
                htmlFor={`q-img-${qIndex}`}
                className="flex items-center justify-center w-18 h-18 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 overflow-hidden bg-gray-50 transition-colors"
              >
                {questionPreviews[qIndex] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={questionPreviews[qIndex]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImagePlus className="w-5 h-5 text-gray-400" />
                    <span className="text-[10px] text-gray-400 font-medium">72×72</span>
                  </div>
                )}
              </label>
              {questionPreviews[qIndex] && (
                <button
                  type="button"
                  onClick={() => removeQuestionImage(qIndex)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Question text */}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
                Question {qIndex + 1}
              </span>
              <Input
                {...register(`questions.${qIndex}.content`, { required: true })}
                placeholder="Tapez votre question ici..."
                className="mt-1 border-t-0 border-x-0 border-b-2 border-gray-100 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-indigo-500 text-base font-medium bg-transparent"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                remove(qIndex);
                setQuestionPreviews((prev) => {
                  const next = [...prev];
                  next.splice(qIndex, 1);
                  return next;
                });
              }}
              className="shrink-0 text-gray-300 hover:text-red-500 transition-colors text-sm font-bold cursor-pointer"
            >
              Supprimer
            </button>
          </div>

          {/* Options */}
          <NestedOptions
            nestIndex={qIndex}
            control={control}
            register={register}
            setValue={setValue}
            watch={watch}
          />
        </div>
      ))}

      {/* Add question */}
      <button
        type="button"
        onClick={() => {
          append({ content: "", image: "", options: [emptyOption(), emptyOption()] });
          setQuestionPreviews((prev) => [...prev, ""]);
        }}
        className="group flex items-center justify-center gap-3 w-full py-5 bg-white border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-400 font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer shadow-sm"
      >
        <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 group-hover:bg-indigo-200 rounded-full transition-colors">
          <Plus className="w-4 h-4" />
        </span>
        Ajouter une question
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:bg-gray-400 cursor-pointer"
      >
        {isSubmitting ? "Sauvegarde..." : "Sauvegarder le quiz"}
      </button>
    </form>
  );
}

/* ─── Options imbriquées ─────────────────────────────────────────────────── */

function NestedOptions({
  nestIndex,
  control,
  register,
  setValue,
  watch,
}: {
  nestIndex: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${nestIndex}.options`,
  });

  const options = watch(`questions.${nestIndex}.options`) ?? [];

  const handleOptionImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    oIndex: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 300 * 1024) {
      toast.error("Image trop lourde (max 300 ko)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setValue(`questions.${nestIndex}.options.${oIndex}.image`, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const hasCorrect = options.some((o) => o?.isCorrect === true);

  const selectCorrect = (oIndex: number) => {
    options.forEach((_, i) => {
      setValue(`questions.${nestIndex}.options.${i}.isCorrect`, i === oIndex, {
        shouldDirty: true,
      });
    });
  };

  return (
    <div className="flex flex-col gap-3 pl-5 border-l-2 border-indigo-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-500">Options de réponse</p>
        {!hasCorrect && (
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            ⚠ Sélectionnez la bonne réponse
          </span>
        )}
      </div>

      {fields.map((field, oIndex) => {
        const mode: OptionMode = options[oIndex]?.mode ?? "text";
        const optionImage = options[oIndex]?.image ?? "";
        const isCorrect = options[oIndex]?.isCorrect === true;

        return (
          <div
            key={field.id}
            className={`flex items-center gap-2.5 w-full px-2 py-1.5 rounded-xl border transition-all ${
              isCorrect ? "bg-emerald-50 border-emerald-300" : "border-transparent"
            }`}
          >
            {/* Mode toggle */}
            <div className="shrink-0 flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setValue(`questions.${nestIndex}.options.${oIndex}.mode`, "text");
                  setValue(`questions.${nestIndex}.options.${oIndex}.image`, "");
                }}
                className={`flex items-center justify-center w-8 h-8 transition-colors ${
                  mode === "text"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-400 hover:bg-gray-50"
                }`}
                title="Réponse texte"
              >
                <Type className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue(`questions.${nestIndex}.options.${oIndex}.mode`, "image");
                  setValue(`questions.${nestIndex}.options.${oIndex}.text`, "");
                }}
                className={`flex items-center justify-center w-8 h-8 transition-colors ${
                  mode === "image"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-400 hover:bg-gray-50"
                }`}
                title="Réponse image"
              >
                <ImagePlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Contenu selon mode */}
            {mode === "text" ? (
              <input
                {...register(`questions.${nestIndex}.options.${oIndex}.text` as const)}
                placeholder={`Réponse ${oIndex + 1}`}
                className="flex-1 p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
              />
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  id={`opt-img-${nestIndex}-${oIndex}`}
                  className="hidden"
                  onChange={(e) => handleOptionImageChange(e, oIndex)}
                />
                <label
                  htmlFor={`opt-img-${nestIndex}-${oIndex}`}
                  className="relative flex items-center justify-center w-18 h-18 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 overflow-hidden bg-gray-50 transition-colors"
                >
                  {optionImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={optionImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <ImagePlus className="w-5 h-5 text-gray-400" />
                      <span className="text-[10px] text-gray-400">72×72</span>
                    </div>
                  )}
                </label>
                {optionImage && (
                  <button
                    type="button"
                    onClick={() =>
                      setValue(`questions.${nestIndex}.options.${oIndex}.image`, "")
                    }
                    className="p-1 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Bonne réponse */}
            <button
              type="button"
              onClick={() => selectCorrect(oIndex)}
              title="Bonne réponse"
              className="shrink-0 cursor-pointer"
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 hover:text-emerald-400 transition-colors" />
              )}
            </button>

            <button
              type="button"
              onClick={() => remove(oIndex)}
              className="p-1.5 text-red-300 hover:text-red-500 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => append(emptyOption())}
        className="self-start text-xs font-bold text-indigo-500 hover:text-indigo-700 mt-1 px-3 py-1.5 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
      >
        + Ajouter une option
      </button>
    </div>
  );
}
