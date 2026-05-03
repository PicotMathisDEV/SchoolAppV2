"use client";

import { useSession } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DropMenu from "../_components/DropMenu";
import {
  BookOpen,
  HelpCircle,
  ListOrdered,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Users,
  Plus,
  Unlock,
  Lock,
  Trophy,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

function Arrow({ dir = "right" }: { dir?: "right" | "down" }) {
  return dir === "right" ? (
    <div className="flex items-center justify-center shrink-0">
      <ArrowRight className="w-6 h-6 text-blue-300" />
    </div>
  ) : (
    <div className="flex items-center justify-center w-full py-1">
      <ArrowDown className="w-6 h-6 text-blue-300" />
    </div>
  );
}

function InfoCard({
  icon,
  title,
  desc,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 relative">
      {badge && (
        <span className="absolute -top-2.5 left-4 text-xs font-black uppercase tracking-widest px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-500">
          {badge}
        </span>
      )}
      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="font-bold text-slate-800 text-sm mb-1">{title}</p>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function StudentGuide() {
  return (
    <div className="space-y-10">

      {/* Section 1: Vue d'ensemble — schema matching the image */}
      <section>
        <h2 className="text-base font-bold text-slate-700 mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">1</span>
          Vue d&apos;ensemble
        </h2>

        <div className="space-y-3">
          {/* Page d'accueil */}
          <div className="flex justify-center">
            <div className="bg-blue-600 text-white rounded-2xl px-8 py-4 text-center shadow-lg">
              <p className="font-black text-lg">Page d&apos;accueil</p>
              <p className="text-xs text-blue-200 mt-0.5">Votre tableau de bord</p>
            </div>
          </div>

          <div className="flex justify-center gap-16">
            <Arrow dir="down" />
            <Arrow dir="down" />
          </div>

          {/* Parcours + Libre accès */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-200 flex items-center justify-center">
                  <ListOrdered className="w-4 h-4 text-blue-700" />
                </div>
                <p className="font-bold text-blue-800">Parcours</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Suivi de leçons et de quiz avec progression et note. Plusieurs étapes pour plusieurs chapitres.
              </p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-200 flex items-center justify-center">
                  <Unlock className="w-4 h-4 text-blue-700" />
                </div>
                <p className="font-bold text-blue-800">Libre accès</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accès ouvert à tous les chapitres et quiz. Les quiz ne doivent pas forcément être effectués pour consulter les leçons.
              </p>
            </div>
          </div>

          {/* Arrow from Parcours side only */}
          <div className="flex justify-start pl-[calc(25%-12px)]">
            <Arrow dir="down" />
          </div>

          {/* Leçons (left side, under Parcours) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-200 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                </div>
                <p className="font-bold text-blue-800">Leçons</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explications des composants avec images et textes explicatifs. Exemples pratiques avec vidéos de brasage.
              </p>
            </div>
            <div className="hidden sm:flex items-center justify-center text-xs text-slate-400 italic">
              ← Depuis un parcours
            </div>
          </div>

          <div className="flex justify-start pl-[calc(25%-12px)]">
            <Arrow dir="down" />
          </div>

          {/* Quizz */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-200 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-blue-700" />
                </div>
                <p className="font-bold text-blue-800">Quizz</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Disponibles à la fin des leçons. Doivent être validés pour passer à l&apos;étape suivante du parcours.
              </p>
            </div>
            <div className="hidden sm:flex items-center justify-center text-xs text-slate-400 italic">
              ← Débloqué après la leçon
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Suivre un parcours */}
      <section>
        <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">2</span>
          Suivre un parcours
        </h2>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 space-y-4">
          <p className="text-sm text-blue-700 font-semibold">
            Chaque parcours est composé d&apos;étapes. Vous devez terminer une étape pour débloquer la suivante.
          </p>
          <div className="space-y-2">
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Étape 1 — Terminée</span>
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Leçon lue ✓</span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Quiz : 8/10 ✓</span>
                  </div>
                </div>
              </div>
            </div>
            <Arrow dir="down" />
            <div className="bg-white rounded-xl border-2 border-blue-300 p-4 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-400 animate-pulse shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">Étape 2 — En cours</span>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">Lire la leçon</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">→ Lire</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 opacity-60">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-400">Quiz (bloqué)</span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                  <p className="text-xs text-slate-400 italic pl-1">👆 Lisez d&apos;abord la leçon pour débloquer le quiz</p>
                </div>
              </div>
            </div>
            <Arrow dir="down" />
            <div className="bg-slate-50 rounded-xl border-2 border-slate-200 p-4 flex items-start gap-3 opacity-50">
              <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Étape 3 — Verrouillée</span>
                <p className="text-xs text-slate-400 mt-1">Terminez l&apos;étape 2 pour accéder à celle-ci.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Libre accès */}
      <section>
        <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">3</span>
          Libre accès (menu déroulant)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <p className="font-bold text-blue-800">Mes Leçons</p>
            </div>
            <div className="space-y-2">
              <div className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                <p className="text-xs font-semibold text-blue-600 mb-0.5">Via parcours</p>
                <p className="text-xs text-slate-500">Leçons terminées dans un parcours — relecture possible</p>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                <p className="text-xs font-semibold text-blue-600 mb-0.5">Accès direct</p>
                <p className="text-xs text-slate-500">Leçons assignées directement à votre classe</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <p className="font-bold text-blue-800">Mes Quiz</p>
            </div>
            <div className="space-y-2">
              <div className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                <p className="text-xs font-semibold text-blue-600 mb-0.5">Via parcours</p>
                <p className="text-xs text-slate-500">Quiz tentés dans un parcours — résultat + possibilité de refaire</p>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                <p className="text-xs font-semibold text-blue-600 mb-0.5">Accès direct</p>
                <p className="text-xs text-slate-500">Quiz assignés directement — pas besoin de faire la leçon d&apos;abord</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TeacherGuide() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">1</span>
          Créer du contenu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoCard icon={<BookOpen className="w-5 h-5" />} title="Leçons" desc="Créez des leçons avec l'éditeur riche : texte, images, tableaux, code. Ajoutez une image de couverture." />
          <InfoCard icon={<HelpCircle className="w-5 h-5" />} title="Quiz" desc="Créez des questions avec options texte ou image. Cochez la bonne réponse (obligatoire avant de sauvegarder)." />
          <InfoCard icon={<ListOrdered className="w-5 h-5" />} title="Parcours" desc="Assemblez des étapes ordonnées. Chaque étape = une leçon + un quiz optionnel. L'élève progresse dans l'ordre." />
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">2</span>
          Créer un parcours
        </h2>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            {[
              { step: "A", title: "Créer le parcours", desc: "Menu → Créer un parcours → Donner un titre" },
              { step: "B", title: "Ajouter des étapes", desc: "Sélectionner une leçon + quiz associé. Répéter. ↑↓ pour réordonner." },
              { step: "C", title: "Assigner aux classes", desc: "Cocher les classes concernées → Sauvegarder → Visible par les élèves." },
            ].map((item, i) => (
              <div key={item.step} className="flex items-start gap-3 flex-1">
                <div className="bg-white rounded-xl border border-blue-200 p-4 flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-500 mb-1">Étape {item.step}</p>
                  <p className="text-sm font-bold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
                {i < 2 && <ArrowRight className="w-5 h-5 text-blue-300 shrink-0 mt-5 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">3</span>
          Gérer les classes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="font-bold text-blue-800">Gestion → Classes</p>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              {[
                { icon: <Plus className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />, text: "Créer une classe et y ajouter des élèves (nom + email + mot de passe provisoire)" },
                { icon: <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />, text: "Assigner des leçons directement à la classe" },
                { icon: <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />, text: "Assigner des quiz directement à la classe" },
                { icon: <ListOrdered className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />, text: "Les parcours sont assignés depuis l'éditeur de parcours" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <p className="font-bold text-blue-800">Différence Parcours vs Direct</p>
            </div>
            <div className="space-y-2">
              <div className="bg-white rounded-xl p-3 border border-blue-200">
                <p className="text-xs font-bold text-blue-700 mb-1">Parcours</p>
                <p className="text-xs text-slate-600">L&apos;élève doit lire la leçon AVANT de faire le quiz. Les étapes sont ordonnées et verrouillées.</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-blue-200">
                <p className="text-xs font-bold text-blue-700 mb-1">Accès direct</p>
                <p className="text-xs text-slate-600">L&apos;élève accède librement aux leçons et quiz. Pas d&apos;ordre imposé, pas de prérequis.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function GuidePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Chargement…</p>
      </div>
    );
  }

  const isTeacher = (session.user as { role?: string }).role === "teacher";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href={isTeacher ? "/gestion" : "/dashboard"}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" /> Retour
          </Link>
          <div className="h-4 w-px bg-slate-200 shrink-0" />
          <span className="font-semibold text-slate-800 text-sm flex-1">Guide d&apos;utilisation</span>
          <DropMenu user={{ name: session.user.name, email: session.user.email, image: session.user.image, role: session.user.role }} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isTeacher ? "bg-blue-100 text-blue-700" : "bg-blue-100 text-blue-700"}`}>
              {isTeacher ? <Users className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
              {isTeacher ? "Professeur" : "Élève"}
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Comment utiliser l&apos;application ?</h1>
          <p className="text-slate-500 text-sm">
            Ce guide est adapté à votre rôle : <strong>{isTeacher ? "professeur" : "élève"}</strong>.
          </p>
        </div>

        {isTeacher ? <TeacherGuide /> : <StudentGuide />}
      </div>
    </div>
  );
}
